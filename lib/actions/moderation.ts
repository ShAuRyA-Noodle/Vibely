"use server";

import connectDB from "@/lib/db";
import { Post } from "@/models/post.model";
import { Report, ReportReason } from "@/models/report.model";
import { Strike, StrikeSeverity, StrikeSource } from "@/models/strike.model";
import { User } from "@/models/user.model";
import { Types } from "mongoose";
import { revalidatePath } from "next/cache";
import { requireOnboardedUserProfile, serializeUser, UserDTO } from "./users";
import { checkContent, ModerationResult } from "@/lib/moderation/proofguard";

// Tunables
const AUTO_BAN_STRIKE_THRESHOLD = 3;
const RESTRICT_DAYS_MINOR = 7;
const RESTRICT_DAYS_MAJOR = 30;
const REPORT_AUTO_HIDE_THRESHOLD = 3; // 3 reports on a post hides it pending review

// =====================================================================
// PUBLIC: content check (used by PostComposer preview)
// =====================================================================

export async function checkPostContentAction(input: {
  body: string;
  media: { type: "image" | "video"; url: string; publicId: string }[];
}): Promise<ModerationResult> {
  await requireOnboardedUserProfile();
  return checkContent({ text: input.body, media: input.media });
}

// =====================================================================
// PUBLIC: report a post
// =====================================================================

export type ReportInput = {
  postId: string;
  reason: ReportReason;
  description?: string;
};

export type ReportResult = {
  ok: boolean;
  message: string;
  alreadyReported?: boolean;
};

export async function reportPostAction(
  input: ReportInput
): Promise<ReportResult> {
  const viewer = await requireOnboardedUserProfile();
  await connectDB();

  if (!Types.ObjectId.isValid(input.postId)) {
    return { ok: false, message: "Invalid post." };
  }

  const post = await Post.findById(input.postId).select("author");
  if (!post) {
    return { ok: false, message: "Post not found." };
  }

  if (post.author.toString() === viewer.id) {
    return { ok: false, message: "You can't report your own post." };
  }

  try {
    await Report.create({
      post: post._id,
      reporter: new Types.ObjectId(viewer.id),
      reportedUser: post.author,
      reason: input.reason,
      description: (input.description || "").slice(0, 500),
      status: "pending",
    });
  } catch (err: any) {
    if (err?.code === 11000) {
      return {
        ok: false,
        alreadyReported: true,
        message: "You've already reported this post. Our team is reviewing it.",
      };
    }
    throw err;
  }

  // Recount reports, auto-hide if threshold crossed
  const reportCount = await Report.countDocuments({
    post: post._id,
    status: { $in: ["pending", "reviewing"] },
  });

  const shouldAutoHide = reportCount >= REPORT_AUTO_HIDE_THRESHOLD;
  await Post.updateOne(
    { _id: post._id },
    {
      $set: {
        reportCount,
        ...(shouldAutoHide ? { isHidden: true } : {}),
      },
    }
  );

  revalidatePath("/feed");
  revalidatePath("/moderation");

  return {
    ok: true,
    message: shouldAutoHide
      ? "Report received. Post auto-hidden pending moderator review."
      : "Report received. Our team will review within 24 hours.",
  };
}

// =====================================================================
// ADMIN: queue + decisions
// =====================================================================

export type ReportDTO = {
  id: string;
  postId: string;
  reason: string;
  description: string;
  status: string;
  createdAt: string;
  reporter: UserDTO;
  reportedUser: UserDTO & { strikeCount: number; isBanned: boolean };
  post: {
    id: string;
    body: string;
    mediaCount: number;
    moderation?: {
      decision: string;
      score: number;
      categories: string[];
    };
  };
};

async function requireModerator() {
  const viewer = await requireOnboardedUserProfile();
  await connectDB();
  const user = await User.findById(viewer.id).select("role");
  if (!user || (user.role !== "moderator" && user.role !== "admin")) {
    throw new Error("Moderator access required.");
  }
  return { viewerId: viewer.id, role: user.role };
}

export async function isModerator(): Promise<boolean> {
  try {
    const viewer = await requireOnboardedUserProfile();
    await connectDB();
    const user = await User.findById(viewer.id).select("role");
    return user?.role === "moderator" || user?.role === "admin";
  } catch {
    return false;
  }
}

export async function getModerationQueue(): Promise<ReportDTO[]> {
  await requireModerator();

  const reports = await Report.find({
    status: { $in: ["pending", "reviewing"] },
  })
    .sort({ createdAt: -1 })
    .limit(100)
    .populate("reporter")
    .populate("reportedUser")
    .populate("post")
    .lean();

  return Promise.all(
    reports.map(async (r: any) => {
      const reporterUser = await serializeUser(r.reporter);
      const reportedUser = await serializeUser(r.reportedUser);
      const post = r.post || {};

      return {
        id: r._id.toString(),
        postId: post._id?.toString() || "",
        reason: r.reason,
        description: r.description || "",
        status: r.status,
        createdAt: r.createdAt.toISOString(),
        reporter: reporterUser,
        reportedUser: {
          ...reportedUser,
          strikeCount: r.reportedUser?.strikeCount || 0,
          isBanned: r.reportedUser?.isBanned || false,
        },
        post: {
          id: post._id?.toString() || "",
          body: (post.body || "").slice(0, 300),
          mediaCount: (post.media || []).length,
          moderation: post.moderation
            ? {
                decision: post.moderation.decision,
                score: post.moderation.score,
                categories: post.moderation.categories || [],
              }
            : undefined,
        },
      };
    })
  );
}

export type ResolveInput = {
  reportId: string;
  resolution:
    | "no_action"
    | "content_removed"
    | "user_warned"
    | "user_struck"
    | "user_banned";
  note?: string;
};

export async function resolveReportAction(
  input: ResolveInput
): Promise<{ ok: boolean; message: string }> {
  const { viewerId } = await requireModerator();

  if (!Types.ObjectId.isValid(input.reportId)) {
    return { ok: false, message: "Invalid report." };
  }

  const report = await Report.findById(input.reportId);
  if (!report) return { ok: false, message: "Report not found." };
  if (report.status === "resolved" || report.status === "dismissed") {
    return { ok: false, message: "Report already resolved." };
  }

  const resolverId = new Types.ObjectId(viewerId);
  report.status = input.resolution === "no_action" ? "dismissed" : "resolved";
  report.resolution = input.resolution;
  report.resolvedBy = resolverId;
  report.resolvedAt = new Date();
  report.reviewerNote = (input.note || "").slice(0, 500);
  await report.save();

  switch (input.resolution) {
    case "no_action":
      // Unhide post if it was auto-hidden by volume
      await Post.updateOne(
        { _id: report.post },
        { $set: { isHidden: false } }
      );
      break;

    case "content_removed":
      await Post.updateOne({ _id: report.post }, { $set: { isHidden: true } });
      break;

    case "user_warned":
      await issueStrike(report.reportedUser, "warning", "report_review", {
        reason: `Warned for reported post (${report.reason}).`,
        postId: report.post,
        reportId: report._id,
        categories: [report.reason],
      });
      await Post.updateOne({ _id: report.post }, { $set: { isHidden: true } });
      break;

    case "user_struck":
      await issueStrike(report.reportedUser, "minor", "report_review", {
        reason: `Strike for reported post (${report.reason}).`,
        postId: report.post,
        reportId: report._id,
        categories: [report.reason],
      });
      await Post.updateOne({ _id: report.post }, { $set: { isHidden: true } });
      break;

    case "user_banned":
      await banUser(
        report.reportedUser,
        `Banned after report review: ${report.reason}.`
      );
      await Post.updateOne({ _id: report.post }, { $set: { isHidden: true } });
      break;
  }

  revalidatePath("/moderation");
  revalidatePath("/feed");
  return { ok: true, message: "Report resolved." };
}

// =====================================================================
// Internal helpers — strike/ban logic
// =====================================================================

export async function issueStrike(
  userId: Types.ObjectId | string,
  severity: StrikeSeverity,
  source: StrikeSource,
  ctx: {
    reason: string;
    postId?: Types.ObjectId | string;
    reportId?: Types.ObjectId | string;
    categories?: string[];
    issuedBy?: Types.ObjectId | string;
  }
) {
  await connectDB();
  const userObjectId =
    typeof userId === "string" ? new Types.ObjectId(userId) : userId;

  await Strike.create({
    user: userObjectId,
    issuedBy: ctx.issuedBy
      ? typeof ctx.issuedBy === "string"
        ? new Types.ObjectId(ctx.issuedBy)
        : ctx.issuedBy
      : undefined,
    post: ctx.postId
      ? typeof ctx.postId === "string"
        ? new Types.ObjectId(ctx.postId)
        : ctx.postId
      : undefined,
    report: ctx.reportId
      ? typeof ctx.reportId === "string"
        ? new Types.ObjectId(ctx.reportId)
        : ctx.reportId
      : undefined,
    severity,
    source,
    reason: ctx.reason,
    categories: ctx.categories || [],
    expiresAt:
      severity === "minor"
        ? new Date(Date.now() + RESTRICT_DAYS_MINOR * 86400_000)
        : severity === "major"
          ? new Date(Date.now() + RESTRICT_DAYS_MAJOR * 86400_000)
          : undefined,
  });

  // Tally non-warning strikes
  const count = await Strike.countDocuments({
    user: userObjectId,
    severity: { $in: ["minor", "major"] },
  });

  // Restrict or ban based on count
  const user = await User.findById(userObjectId);
  if (!user) return;

  user.strikeCount = count;

  if (count >= AUTO_BAN_STRIKE_THRESHOLD) {
    user.isBanned = true;
    user.bannedAt = new Date();
    user.banReason = `Auto-banned after ${count} strikes.`;
  } else if (severity === "major") {
    user.restrictedUntil = new Date(
      Date.now() + RESTRICT_DAYS_MAJOR * 86400_000
    );
  } else if (severity === "minor") {
    user.restrictedUntil = new Date(
      Date.now() + RESTRICT_DAYS_MINOR * 86400_000
    );
  }

  await user.save();
}

async function banUser(
  userId: Types.ObjectId | string,
  reason: string
) {
  await connectDB();
  const userObjectId =
    typeof userId === "string" ? new Types.ObjectId(userId) : userId;
  await User.updateOne(
    { _id: userObjectId },
    {
      $set: {
        isBanned: true,
        bannedAt: new Date(),
        banReason: reason.slice(0, 500),
      },
    }
  );
}

// =====================================================================
// Gate: is the current user allowed to post?
// =====================================================================

export async function getPostingEligibility(): Promise<{
  canPost: boolean;
  reason?: string;
  restrictedUntil?: string;
}> {
  const viewer = await requireOnboardedUserProfile();
  await connectDB();
  const user = await User.findById(viewer.id).select(
    "isBanned banReason restrictedUntil"
  );
  if (!user) return { canPost: false, reason: "Account not found." };

  if (user.isBanned) {
    return {
      canPost: false,
      reason:
        user.banReason ||
        "Your account has been banned for community guidelines violations.",
    };
  }

  if (user.restrictedUntil && user.restrictedUntil.getTime() > Date.now()) {
    return {
      canPost: false,
      reason:
        "Your posting privileges are temporarily restricted due to community guideline violations.",
      restrictedUntil: user.restrictedUntil.toISOString(),
    };
  }

  return { canPost: true };
}

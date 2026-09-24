"use client";

import { useState, useTransition } from "react";
import {
  resolveReportAction,
  type ReportDTO,
} from "@/lib/actions/moderation";
import ProfilePhoto from "@/components/shared/ProfilePhoto";
import {
  ShieldCheck,
  EyeOff,
  UserMinus,
  AlertTriangle,
  Ban,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import ReactTimeago from "react-timeago";

const RESOLUTIONS: {
  key:
    | "no_action"
    | "content_removed"
    | "user_warned"
    | "user_struck"
    | "user_banned";
  label: string;
  icon: typeof ShieldCheck;
  tone: "default" | "warning" | "danger";
  description: string;
}[] = [
  {
    key: "no_action",
    label: "Dismiss",
    icon: CheckCircle2,
    tone: "default",
    description: "No violation — unhide post if auto-hidden.",
  },
  {
    key: "content_removed",
    label: "Hide post",
    icon: EyeOff,
    tone: "warning",
    description: "Remove post from public view, no user penalty.",
  },
  {
    key: "user_warned",
    label: "Warn user",
    icon: AlertTriangle,
    tone: "warning",
    description: "Issue a warning (no strike count).",
  },
  {
    key: "user_struck",
    label: "Strike user",
    icon: UserMinus,
    tone: "danger",
    description: "Issue a strike. 3 strikes = auto-ban.",
  },
  {
    key: "user_banned",
    label: "Ban user",
    icon: Ban,
    tone: "danger",
    description: "Permanent account ban.",
  },
];

export default function ModerationQueue({
  initialReports,
}: {
  initialReports: ReportDTO[];
}) {
  const [reports, setReports] = useState(initialReports);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleResolve(reportId: string, resolution: typeof RESOLUTIONS[0]["key"]) {
    startTransition(async () => {
      const result = await resolveReportAction({
        reportId,
        resolution,
        note: note.trim() || undefined,
      });
      if (result.ok) {
        toast.success(result.message);
        setReports((rs) => rs.filter((r) => r.id !== reportId));
        setExpanded(null);
        setNote("");
      } else {
        toast.error(result.message);
      }
    });
  }

  if (reports.length === 0) {
    return (
      <div className="surface-elevated flex flex-col items-center justify-center p-16 text-center">
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-green-500/10">
          <ShieldCheck
            size={20}
            className="text-green-600 dark:text-green-400"
            strokeWidth={2}
          />
        </div>
        <p className="text-[14px] font-semibold text-foreground">
          Queue is empty
        </p>
        <p className="mt-1 text-[12.5px] text-muted-foreground">
          Every report has been reviewed. Great job.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {reports.map((report) => {
        const isExpanded = expanded === report.id;
        return (
          <div key={report.id} className="surface-elevated p-4">
            <div className="flex items-start gap-3">
              <ProfilePhoto
                src={report.reportedUser.avatarUrl}
                name={report.reportedUser.name}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/profile/${report.reportedUser.handle}`}
                    className="text-[14px] font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    {report.reportedUser.name}
                  </Link>
                  <span className="rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    {report.reason}
                  </span>
                  {report.reportedUser.isBanned && (
                    <span className="rounded-md bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive uppercase tracking-wider">
                      Banned
                    </span>
                  )}
                  {report.reportedUser.strikeCount > 0 && (
                    <span className="rounded-md bg-yellow-500/10 px-1.5 py-0.5 text-[10px] font-medium text-yellow-600 dark:text-yellow-400 uppercase tracking-wider">
                      {report.reportedUser.strikeCount} strike
                      {report.reportedUser.strikeCount > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-muted-foreground">
                  Reported by{" "}
                  <Link
                    href={`/profile/${report.reporter.handle}`}
                    className="text-primary hover:underline"
                  >
                    @{report.reporter.handle}
                  </Link>{" "}
                  •{" "}
                  <span className="tabular-nums">
                    <ReactTimeago date={new Date(report.createdAt)} />
                  </span>
                </p>

                {report.description && (
                  <p className="mt-2 text-[12.5px] text-foreground/85 italic">
                    &ldquo;{report.description}&rdquo;
                  </p>
                )}

                {/* Post preview */}
                <Link
                  href={`/post/${report.postId}`}
                  className="mt-3 block rounded-lg border border-border bg-muted/50 p-3 hover:bg-muted transition-colors"
                >
                  <p className="text-[13px] text-foreground line-clamp-3 leading-relaxed">
                    {report.post.body || (
                      <span className="text-muted-foreground">
                        (media only — click to view)
                      </span>
                    )}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                    {report.post.mediaCount > 0 && (
                      <span>
                        {report.post.mediaCount} media attachment
                        {report.post.mediaCount > 1 ? "s" : ""}
                      </span>
                    )}
                    {report.post.moderation && (
                      <>
                        <span>·</span>
                        <span
                          className={
                            report.post.moderation.decision === "block"
                              ? "text-destructive font-medium"
                              : report.post.moderation.decision === "flag"
                                ? "text-yellow-600 dark:text-yellow-400 font-medium"
                                : "text-green-600 dark:text-green-400"
                          }
                        >
                          ProofGuard: {report.post.moderation.decision} (
                          {report.post.moderation.score})
                        </span>
                      </>
                    )}
                  </div>
                </Link>

                {!isExpanded ? (
                  <button
                    type="button"
                    onClick={() => setExpanded(report.id)}
                    className="mt-3 btn-secondary press"
                  >
                    Review
                  </button>
                ) : (
                  <div className="mt-3 border-t border-border pt-3">
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Reviewer note (optional)"
                      rows={2}
                      maxLength={500}
                      className="input-base w-full resize-none mb-3"
                    />
                    <div className="grid sm:grid-cols-2 gap-2">
                      {RESOLUTIONS.map((r) => {
                        const Icon = r.icon;
                        const toneClass =
                          r.tone === "danger"
                            ? "border-destructive/30 text-destructive hover:bg-destructive/10"
                            : r.tone === "warning"
                              ? "border-yellow-500/30 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/10"
                              : "border-border text-foreground hover:bg-muted";
                        return (
                          <button
                            key={r.key}
                            type="button"
                            onClick={() => handleResolve(report.id, r.key)}
                            disabled={isPending}
                            className={`flex items-start gap-2.5 rounded-lg border bg-card px-3 py-2.5 text-left transition-all press disabled:opacity-50 ${toneClass}`}
                          >
                            {isPending ? (
                              <Loader2
                                size={14}
                                className="mt-0.5 shrink-0 animate-spin"
                              />
                            ) : (
                              <Icon
                                size={14}
                                strokeWidth={2}
                                className="mt-0.5 shrink-0"
                              />
                            )}
                            <div className="min-w-0">
                              <div className="text-[13px] font-semibold">
                                {r.label}
                              </div>
                              <div className="text-[11px] text-muted-foreground">
                                {r.description}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setExpanded(null);
                        setNote("");
                      }}
                      className="mt-2 text-[12px] text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { ShieldCheck, ShieldAlert, ShieldX, Loader2 } from "lucide-react";
import type { ModerationResult } from "@/lib/moderation/proofguard";

export default function ModerationPreview({
  result,
  loading,
}: {
  result: ModerationResult | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2 text-[12px] text-muted-foreground">
        <Loader2 size={13} className="animate-spin" />
        <span>ProofGuard scanning…</span>
      </div>
    );
  }

  if (!result) return null;

  if (result.decision === "allow" && result.violations.length === 0) {
    return (
      <div className="mt-3 flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/[0.06] px-3 py-2 text-[12px]">
        <ShieldCheck
          size={13}
          className="text-green-600 dark:text-green-400"
          strokeWidth={2.5}
        />
        <span className="font-medium text-green-700 dark:text-green-300">
          ProofGuard cleared — safe to post.
        </span>
      </div>
    );
  }

  if (result.decision === "flag") {
    return (
      <div className="mt-3 rounded-lg border border-yellow-500/30 bg-yellow-500/[0.08] px-3 py-2.5">
        <div className="flex items-center gap-2 text-[12.5px]">
          <ShieldAlert
            size={14}
            className="text-yellow-600 dark:text-yellow-400 shrink-0"
            strokeWidth={2.5}
          />
          <span className="font-semibold text-yellow-700 dark:text-yellow-300">
            Heads up: this post may be flagged for review.
          </span>
        </div>
        <p className="mt-1 text-[11.5px] text-yellow-700/80 dark:text-yellow-300/80">
          {result.summary}
        </p>
        {result.violations.length > 0 && (
          <ul className="mt-1.5 space-y-0.5">
            {result.violations.slice(0, 3).map((v, i) => (
              <li
                key={i}
                className="text-[11px] text-yellow-700/70 dark:text-yellow-300/70"
              >
                • {v.explanation}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // block
  return (
    <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/[0.08] px-3 py-2.5">
      <div className="flex items-center gap-2 text-[12.5px]">
        <ShieldX
          size={14}
          className="text-red-600 dark:text-red-400 shrink-0"
          strokeWidth={2.5}
        />
        <span className="font-semibold text-red-700 dark:text-red-300">
          ProofGuard will block this post.
        </span>
      </div>
      <p className="mt-1 text-[11.5px] text-red-700/80 dark:text-red-300/80">
        {result.summary}
      </p>
      {result.violations.length > 0 && (
        <ul className="mt-1.5 space-y-0.5">
          {result.violations.slice(0, 3).map((v, i) => (
            <li
              key={i}
              className="text-[11px] text-red-700/70 dark:text-red-300/70"
            >
              • {v.explanation}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 text-[11px] text-red-700/60 dark:text-red-300/60">
        Edit your post to remove the flagged content before submitting.
      </p>
    </div>
  );
}

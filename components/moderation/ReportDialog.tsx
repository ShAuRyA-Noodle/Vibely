"use client";

import { useState, useTransition } from "react";
import { X, ShieldAlert, Loader2 } from "lucide-react";
import { reportPostAction } from "@/lib/actions/moderation";
import { ReportReason } from "@/models/report.model";
import { toast } from "sonner";

const REASONS: { key: ReportReason; label: string; hint: string }[] = [
  { key: "spam", label: "Spam", hint: "Commercial manipulation or scams." },
  {
    key: "harassment",
    label: "Harassment or bullying",
    hint: "Targeted attacks on a person.",
  },
  {
    key: "hateSpeech",
    label: "Hate speech",
    hint: "Attacks based on identity or protected class.",
  },
  {
    key: "sexual",
    label: "Adult content",
    hint: "Sexual or explicit material.",
  },
  {
    key: "violence",
    label: "Violence or threats",
    hint: "Graphic violence or credible threats.",
  },
  {
    key: "selfHarm",
    label: "Self-harm",
    hint: "Content promoting self-injury or suicide.",
  },
  {
    key: "misinformation",
    label: "Misinformation",
    hint: "False claims that could cause harm.",
  },
  {
    key: "impersonation",
    label: "Impersonation",
    hint: "Pretending to be someone else.",
  },
  {
    key: "intellectualProperty",
    label: "Intellectual property",
    hint: "Copyright or trademark violations.",
  },
  { key: "other", label: "Something else", hint: "Describe the issue below." },
];

export default function ReportDialog({
  postId,
  open,
  onClose,
}: {
  postId: string;
  open: boolean;
  onClose: () => void;
}) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [description, setDescription] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason) {
      toast.error("Pick a reason.");
      return;
    }
    startTransition(async () => {
      const result = await reportPostAction({
        postId,
        reason,
        description: description.trim(),
      });
      if (result.ok) {
        toast.success(result.message);
        onClose();
        setReason(null);
        setDescription("");
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-[100] bg-foreground/30 backdrop-blur-sm animate-fade-in"
      />
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none animate-fade-up">
        <div
          className="w-full max-w-lg pointer-events-auto surface-elevated shadow-2xl"
          role="dialog"
          aria-labelledby="report-title"
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <ShieldAlert size={17} className="text-primary" strokeWidth={2} />
              <h2
                id="report-title"
                className="text-[15px] font-semibold text-foreground tracking-tight"
              >
                Report post
              </h2>
            </div>
            <button
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors press"
            >
              <X size={15} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5">
            <p className="text-[13px] text-muted-foreground mb-4">
              Your report is anonymous to the post author. ProofGuard will
              review it within 24 hours.
            </p>

            <div className="grid gap-1.5 mb-4">
              {REASONS.map((r) => (
                <label
                  key={r.key}
                  className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition-all press ${
                    reason === r.key
                      ? "border-primary bg-primary/[0.06]"
                      : "border-border bg-card hover:bg-muted"
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r.key}
                    checked={reason === r.key}
                    onChange={() => setReason(r.key)}
                    className="mt-0.5 h-4 w-4 accent-primary"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-[13.5px] font-medium text-foreground">
                      {r.label}
                    </div>
                    <div className="text-[12px] text-muted-foreground">
                      {r.hint}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <label className="block">
              <span className="mb-1.5 block text-[12px] font-medium text-muted-foreground">
                Additional context (optional)
              </span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Help the review team understand what's wrong…"
                className="input-base w-full resize-none"
              />
            </label>

            <div className="mt-4 flex items-center justify-end gap-2 border-t border-border pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary press"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || !reason}
                className="btn-primary press disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                {isPending && <Loader2 size={14} className="animate-spin" />}
                Submit report
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

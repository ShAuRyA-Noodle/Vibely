import {
  getModerationQueue,
  isModerator,
} from "@/lib/actions/moderation";
import ModerationQueue from "@/components/moderation/ModerationQueue";
import { ShieldAlert, Shield } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ModerationPage() {
  const hasAccess = await isModerator();

  if (!hasAccess) {
    return (
      <section className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="surface-elevated p-10">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-muted">
            <ShieldAlert
              size={20}
              className="text-muted-foreground"
              strokeWidth={1.75}
            />
          </div>
          <h1 className="text-[20px] font-semibold tracking-tight text-foreground">
            Moderator access required
          </h1>
          <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
            This panel is for ProofGuard moderators. If you believe you should
            have access, contact your administrator.
          </p>
          <p className="mt-4 text-[11.5px] text-muted-foreground">
            Admins: set <code className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-mono text-foreground">role: &quot;admin&quot;</code> on your user
            document in MongoDB to unlock this page.
          </p>
        </div>
      </section>
    );
  }

  const reports = await getModerationQueue();

  return (
    <section className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Shield size={18} strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight text-foreground">
            ProofGuard moderation
          </h1>
          <p className="text-[13px] text-muted-foreground tabular-nums">
            {reports.length} report{reports.length === 1 ? "" : "s"} awaiting
            review
          </p>
        </div>
      </div>

      <ModerationQueue initialReports={reports} />
    </section>
  );
}

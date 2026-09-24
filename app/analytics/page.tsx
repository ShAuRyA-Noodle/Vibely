import { getDashboardStats } from "@/lib/actions/analytics";
import { requireOnboardedUserProfile } from "@/lib/actions/users";
import { BarChart3, Eye, FileText, Heart } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  await requireOnboardedUserProfile();
  const stats = await getDashboardStats();

  const cards = [
    { label: "Total impressions", value: stats.totalImpressions, icon: Eye },
    { label: "Profile views (7d)", value: stats.profileViewsLast7Days, icon: BarChart3 },
    { label: "Profile views (30d)", value: stats.profileViewsLast30Days, icon: BarChart3 },
    { label: "Total posts", value: stats.totalPosts, icon: FileText },
    { label: "Total reactions", value: stats.totalReactions, icon: Heart },
  ];

  return (
    <section className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-8 text-[28px] font-semibold tracking-tight text-foreground">
        Analytics
      </h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="surface-elevated p-5 flex items-start gap-4">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <card.icon size={17} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <p className="text-[24px] font-semibold text-foreground tabular-nums tracking-tight">
                {card.value.toLocaleString()}
              </p>
              <p className="text-[12px] text-muted-foreground font-medium">
                {card.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

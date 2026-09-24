import ConnectionsPage from "@/components/connections/ConnectionsPage";
import {
  getConnectionRequests,
  getConnections,
  getSuggestedConnections,
} from "@/lib/actions/connections";
import { requireOnboardedUserProfile } from "@/lib/actions/users";

export const dynamic = "force-dynamic";

export default async function ConnectionsRoute({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  await requireOnboardedUserProfile();

  const [requests, connections, suggestions] = await Promise.all([
    getConnectionRequests(),
    getConnections(),
    getSuggestedConnections(),
  ]);

  return (
    <section className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-[28px] font-semibold tracking-tight text-foreground">
        Network
      </h1>
      <ConnectionsPage
        requests={requests}
        connections={connections}
        suggestions={suggestions}
        activeTab={tab || "requests"}
      />
    </section>
  );
}

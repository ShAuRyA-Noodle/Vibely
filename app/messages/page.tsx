import ConversationList from "@/components/messages/ConversationList";
import { getConversations } from "@/lib/actions/messages";
import { requireOnboardedUserProfile } from "@/lib/actions/users";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const viewer = await requireOnboardedUserProfile();
  const { conversations } = await getConversations();

  return (
    <section className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-[28px] font-semibold tracking-tight text-foreground">
        Messages
      </h1>
      <ConversationList conversations={conversations} viewerId={viewer.id} />
    </section>
  );
}

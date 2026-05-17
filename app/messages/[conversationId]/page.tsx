import MessageThread from "@/components/messages/MessageThread";
import {
  getMessages,
  markConversationReadAction,
} from "@/lib/actions/messages";
import { requireOnboardedUserProfile } from "@/lib/actions/users";
import { Conversation } from "@/models/conversation.model";
import { serializeUser } from "@/lib/actions/users";
import connectDB from "@/lib/db";
import { Types } from "mongoose";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const viewer = await requireOnboardedUserProfile();
  await connectDB();

  if (!Types.ObjectId.isValid(conversationId)) notFound();

  const conv = await Conversation.findOne({
    _id: conversationId,
    participants: new Types.ObjectId(viewer.id),
  }).populate("participants");

  if (!conv) notFound();

  await markConversationReadAction(conversationId);

  const otherUser = (conv.participants as any[]).find(
    (p: any) => p._id.toString() !== viewer.id
  );

  if (!otherUser) notFound();

  const otherUserDTO = await serializeUser(otherUser);
  const { messages } = await getMessages(conversationId);

  return (
    <section className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-5 flex items-center gap-3">
        <Link
          href="/messages"
          className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors press"
        >
          <ArrowLeft size={17} strokeWidth={2} />
        </Link>
        <div>
          <h1 className="text-[18px] font-semibold tracking-tight text-foreground">
            {otherUserDTO.name}
          </h1>
          <p className="text-xs text-muted-foreground">@{otherUserDTO.handle}</p>
        </div>
      </div>
      <MessageThread
        conversationId={conversationId}
        viewerId={viewer.id}
        initialMessages={messages}
        otherUser={otherUserDTO}
      />
    </section>
  );
}

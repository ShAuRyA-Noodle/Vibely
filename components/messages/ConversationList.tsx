"use client";

import { ConversationDTO } from "@/lib/actions/messages";
import ProfilePhoto from "@/components/shared/ProfilePhoto";
import Link from "next/link";
import ReactTimeago from "react-timeago";

export default function ConversationList({
  conversations,
}: {
  conversations: ConversationDTO[];
  viewerId: string;
}) {
  if (conversations.length === 0) {
    return (
      <div className="surface-elevated p-8 text-center">
        <p className="text-[13px] text-muted-foreground">
          No conversations yet. Visit someone&apos;s profile to start a chat.
        </p>
      </div>
    );
  }

  return (
    <div className="surface-elevated overflow-hidden divide-y divide-border">
      {conversations.map((conv) => (
        <Link
          key={conv.id}
          href={`/messages/${conv.id}`}
          className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted transition-colors press"
        >
          <ProfilePhoto
            src={conv.otherUser.avatarUrl}
            name={conv.otherUser.name}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3
                className={`text-[14px] truncate ${
                  conv.unreadCount > 0
                    ? "font-semibold text-foreground"
                    : "font-medium text-foreground/90"
                }`}
              >
                {conv.otherUser.name}
              </h3>
              <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
                <ReactTimeago date={new Date(conv.lastMessageAt)} />
              </span>
            </div>
            <p
              className={`truncate text-[12.5px] ${
                conv.unreadCount > 0
                  ? "font-medium text-foreground/90"
                  : "text-muted-foreground"
              }`}
            >
              {conv.lastMessageBody || "No messages yet"}
            </p>
          </div>
          {conv.unreadCount > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground tabular-nums">
              {conv.unreadCount}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}

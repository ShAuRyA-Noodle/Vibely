"use client";

import { MessageDTO, sendMessageAction } from "@/lib/actions/messages";
import { UserDTO } from "@/lib/actions/users";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";

export default function MessageThread({
  conversationId,
  viewerId,
  initialMessages,
  otherUser,
}: {
  conversationId: string;
  viewerId: string;
  initialMessages: MessageDTO[];
  otherUser: UserDTO;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [text, setText] = useState("");
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 5000);
    return () => clearInterval(interval);
  }, [router]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const msg = text.trim();
    if (!msg) return;

    const optimistic: MessageDTO = {
      id: `temp-${Date.now()}`,
      senderId: viewerId,
      body: msg,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setText("");

    startTransition(async () => {
      try {
        await sendMessageAction(conversationId, msg);
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to send.");
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      }
    });
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return (
    <div className="flex flex-col surface-elevated overflow-hidden">
      <div
        className="flex-1 overflow-y-auto p-5 space-y-2"
        style={{ maxHeight: "60vh", minHeight: "300px" }}
      >
        {messages.length === 0 && (
          <p className="text-center text-[13px] text-muted-foreground py-10">
            Start the conversation with {otherUser.name}
          </p>
        )}
        {messages.map((msg) => {
          const isMine = msg.senderId === viewerId;
          return (
            <div
              key={msg.id}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-3.5 py-2 ${
                  isMine
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted text-foreground rounded-bl-md"
                }`}
              >
                <p className="text-[14px] whitespace-pre-wrap leading-snug">
                  {msg.body}
                </p>
                <p
                  className={`mt-0.5 text-[10px] tabular-nums ${
                    isMine ? "text-primary-foreground/60" : "text-muted-foreground"
                  }`}
                >
                  {formatTime(msg.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={onSubmit}
        className="flex items-center gap-2 border-t border-border p-3"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={2000}
          placeholder="Type a message…"
          className="input-base flex-1"
        />
        <button
          type="submit"
          disabled={isPending || !text.trim()}
          className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 press disabled:opacity-40 transition-all"
        >
          <Send size={15} strokeWidth={2} />
        </button>
      </form>
    </div>
  );
}

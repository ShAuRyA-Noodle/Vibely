"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { useNotificationCount } from "@/hooks/use-notification-count";

export default function NotificationBell() {
  const { count } = useNotificationCount();

  return (
    <Link
      href="/notifications"
      className="relative grid h-9 w-9 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition-all duration-200 ease-apple hover:text-foreground hover:border-primary/30 press"
      aria-label={`Notifications${count > 0 ? ` (${count} unread)` : ""}`}
    >
      <Bell size={16} strokeWidth={2} />
      {count > 0 && (
        <span
          className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary"
          style={{ boxShadow: "0 0 0 2px hsl(var(--card))" }}
        />
      )}
    </Link>
  );
}

"use client";

import { ProfileStatsDTO, UserDTO } from "@/lib/actions/users";
import Link from "next/link";
import ProfilePhoto from "./shared/ProfilePhoto";
import {
  Home,
  Users,
  MessageSquare,
  Compass,
  Settings,
  BarChart3,
} from "lucide-react";
import { usePathname } from "next/navigation";

export default function Sidebar({
  user,
  stats,
}: {
  user: UserDTO;
  stats: ProfileStatsDTO;
}) {
  const pathname = usePathname();

  const links = [
    { href: "/feed", icon: Home, label: "Home" },
    { href: "/search", icon: Compass, label: "Explore" },
    { href: "/connections", icon: Users, label: "Network" },
    { href: "/messages", icon: MessageSquare, label: "Messages" },
    { href: "/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <aside className="sticky top-28 hidden h-fit w-full flex-col gap-4 md:flex z-10">
      {/* Profile Card — Double-bezel architecture */}
      <div className="surface-elevated overflow-hidden">
        {/* Header band — subtle gradient */}
        <div className="h-16 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent" />

        <div className="-mt-8 flex flex-col items-center px-5 pb-5 text-center">
          <div className="rounded-full ring-4 ring-card bg-card">
            <ProfilePhoto
              src={user.avatarUrl}
              name={user.name}
              size="lg"
            />
          </div>
          <Link
            href={`/profile/${user.handle}`}
            className="mt-3 text-[15px] font-semibold text-foreground hover:text-primary transition-colors"
          >
            {user.name}
          </Link>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            {user.headline || `@${user.handle}`}
          </p>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 border-t border-border bg-muted/50">
          <Link
            href={`/profile/${user.handle}`}
            className="flex flex-col items-center py-3 hover:bg-muted transition-colors"
          >
            <span className="text-[15px] font-semibold text-foreground font-mono tabular-nums">
              {stats.subscriberCount}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Subscribers
            </span>
          </Link>
          <Link
            href={`/profile/${user.handle}`}
            className="flex flex-col items-center py-3 border-l border-border hover:bg-muted transition-colors"
          >
            <span className="text-[15px] font-semibold text-foreground font-mono tabular-nums">
              {stats.postCount}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Posts
            </span>
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <nav className="surface-elevated p-2">
        <ul className="flex flex-col gap-0.5">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-all duration-150 ease-apple press ${
                    isActive
                      ? "bg-primary/[0.08] text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-primary" />
                  )}
                  <Icon size={16} strokeWidth={2} />
                  <span>{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, MessageSquare, Compass, UserCircle2 } from "lucide-react";

export default function NavItems({ handle }: { handle?: string }) {
  const pathname = usePathname();

  const links = [
    { href: "/feed", icon: Home, label: "Home" },
    { href: "/search", icon: Compass, label: "Explore" },
    { href: "/connections", icon: Users, label: "Network" },
    { href: "/messages", icon: MessageSquare, label: "Messages" },
    {
      href: handle ? `/profile/${handle}` : "/onboarding",
      icon: UserCircle2,
      label: "Profile",
      hideMobile: true,
    },
  ];

  return (
    <>
      {links.map((link) => {
        const isActive = pathname === link.href;
        const Icon = link.icon;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`group relative flex items-center justify-center rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200 ease-apple press ${
              link.hideMobile ? "hidden md:flex" : "flex"
            } ${
              isActive
                ? "text-primary bg-primary/[0.08]"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Icon size={17} className="md:mr-1.5" strokeWidth={2} />
            <span className="hidden md:inline">{link.label}</span>
          </Link>
        );
      })}
    </>
  );
}

"use client";

import Link from "next/link";

const TABS = [
  { key: "posts", label: "Posts" },
  { key: "education", label: "Education" },
  { key: "experience", label: "Experience" },
  { key: "skills", label: "Skills" },
] as const;

export default function ProfileTabs({
  activeTab,
  handle,
}: {
  activeTab: string;
  handle: string;
}) {
  return (
    <div className="mt-6 border-b border-border">
      <div className="flex gap-1">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Link
              key={tab.key}
              href={`/profile/${handle}${
                tab.key === "posts" ? "" : `?tab=${tab.key}`
              }`}
              className={`relative px-4 py-2.5 text-[13.5px] font-medium transition-colors duration-200 ease-apple ${
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-t-full" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

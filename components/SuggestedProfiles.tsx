import { toggleFollowAction } from "@/lib/actions/follows";
import { getSuggestedProfiles } from "@/lib/actions/users";
import Link from "next/link";
import ProfilePhoto from "./shared/ProfilePhoto";
import { UserPlus, Hash } from "lucide-react";

export default async function SuggestedProfiles() {
  const profiles = await getSuggestedProfiles();

  return (
    <aside className="sticky top-28 hidden h-fit w-full flex-col gap-4 lg:flex z-10">
      {/* People you may know */}
      <div className="surface-elevated overflow-hidden">
        <div className="border-b border-border px-5 py-3.5">
          <h2 className="text-[13px] font-semibold text-foreground tracking-tight">
            People you may know
          </h2>
        </div>

        <div className="p-2">
          {profiles.length === 0 ? (
            <div className="px-3 py-8 text-center">
              <p className="text-[13px] text-muted-foreground">
                More builders will appear here soon.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-1">
              {profiles.map((profile) => (
                <li
                  key={profile.id}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted transition-colors"
                >
                  <ProfilePhoto
                    src={profile.avatarUrl}
                    name={profile.name}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/profile/${profile.handle}`}
                      className="block truncate text-[13px] font-semibold text-foreground hover:text-primary transition-colors"
                    >
                      {profile.name}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">
                      {profile.headline || `@${profile.handle}`}
                    </p>
                  </div>
                  <form
                    action={toggleFollowAction.bind(null, profile.id)}
                    className="shrink-0"
                  >
                    <button
                      type="submit"
                      className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-card text-muted-foreground hover:border-primary/30 hover:bg-primary/[0.08] hover:text-primary transition-all press"
                      title="Subscribe"
                    >
                      <UserPlus size={13} strokeWidth={2} />
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Trending */}
      <div className="surface-elevated overflow-hidden">
        <div className="border-b border-border px-5 py-3.5">
          <h2 className="text-[13px] font-semibold text-foreground tracking-tight">
            Trending
          </h2>
        </div>
        <div className="p-3 flex flex-wrap gap-1.5">
          {["buildinpublic", "nextjs", "ai", "design", "vibely"].map((tag) => (
            <Link
              key={tag}
              href={`/search?q=${encodeURIComponent("#" + tag)}`}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-[12px] font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all press"
            >
              <Hash size={11} className="text-primary" />
              {tag}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}

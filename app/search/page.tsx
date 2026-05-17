import PostList from "@/components/PostList";
import SearchResults from "@/components/search/SearchResults";
import {
  searchUsers,
  searchPosts,
  searchByHashtag,
  getTrendingHashtags,
} from "@/lib/actions/search";
import { requireOnboardedUserProfile } from "@/lib/actions/users";
import Link from "next/link";
import { Search, Hash } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tab?: string }>;
}) {
  await requireOnboardedUserProfile();

  const { q, tab: tabParam } = await searchParams;
  const query = q || "";
  const tab = tabParam || "people";
  const isHashtagSearch = query.startsWith("#");

  let users: Awaited<ReturnType<typeof searchUsers>> = [];
  let postResults: Awaited<ReturnType<typeof searchPosts>> = {
    posts: [],
    nextCursor: null,
  };
  let trending: Awaited<ReturnType<typeof getTrendingHashtags>> = [];

  if (query) {
    if (tab === "people" && !isHashtagSearch) {
      users = await searchUsers(query);
    } else if (tab === "posts" || isHashtagSearch) {
      postResults = isHashtagSearch
        ? await searchByHashtag(query)
        : await searchPosts(query);
    }
  }

  trending = await getTrendingHashtags();

  return (
    <section className="mx-auto max-w-4xl px-4 py-8">
      <form action="/search" method="GET" className="mb-6 relative">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          strokeWidth={2}
        />
        <input
          name="q"
          type="search"
          defaultValue={query}
          placeholder="Search people, posts, or #hashtags…"
          className="input-base w-full pl-11 py-3.5 text-[15px]"
        />
      </form>

      {query && !isHashtagSearch && (
        <div className="mb-5 border-b border-border flex gap-1">
          {["people", "posts"].map((t) => {
            const isActive = tab === t;
            return (
              <Link
                key={t}
                href={`/search?q=${encodeURIComponent(query)}&tab=${t}`}
                className={`relative px-4 py-2.5 text-[13.5px] font-medium capitalize transition-colors ${
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-t-full" />
                )}
              </Link>
            );
          })}
        </div>
      )}

      {isHashtagSearch && (
        <h2 className="mb-5 text-[18px] font-semibold tracking-tight text-foreground">
          Posts tagged with <span className="text-primary">{query}</span>
        </h2>
      )}

      {query && tab === "people" && !isHashtagSearch && (
        <SearchResults users={users} />
      )}
      {query && (tab === "posts" || isHashtagSearch) && (
        <PostList
          posts={postResults.posts}
          emptyMessage={`No posts found for "${query}".`}
        />
      )}

      {!query && trending.length > 0 && (
        <div>
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Trending hashtags
          </h2>
          <div className="flex flex-wrap gap-2">
            {trending.map((tag) => (
              <Link
                key={tag.name}
                href={`/search?q=%23${tag.name}&tab=posts`}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-[13px] font-medium text-foreground hover:border-primary/30 hover:bg-muted transition-all press"
              >
                <Hash size={12} className="text-primary" />
                {tag.name}{" "}
                <span className="text-[11px] text-muted-foreground tabular-nums">
                  {tag.postCount}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

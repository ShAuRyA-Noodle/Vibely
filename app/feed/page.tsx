import Feed from "@/components/Feed";
import Sidebar from "@/components/Sidebar";
import SuggestedProfiles from "@/components/SuggestedProfiles";
import { getFeedPosts } from "@/lib/actions/posts";
import {
  getProfileStats,
  requireOnboardedUserProfile,
} from "@/lib/actions/users";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const user = await requireOnboardedUserProfile();
  const [feed, stats] = await Promise.all([
    getFeedPosts(),
    getProfileStats(user.id),
  ]);

  return (
    <div className="mx-auto grid max-w-[1400px] gap-5 px-4 py-8 md:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_320px]">
      <div className="hidden md:block">
        <Sidebar user={user} stats={stats} />
      </div>
      <div className="min-w-0">
        <Feed user={user} initialFeed={feed} />
      </div>
      <div className="hidden xl:block">
        <SuggestedProfiles />
      </div>
    </div>
  );
}

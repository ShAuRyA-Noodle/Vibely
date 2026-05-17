import { getPostById } from "@/lib/actions/posts";
import { requireOnboardedUserProfile } from "@/lib/actions/users";
import PostCard from "@/components/PostCard";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PostPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  await requireOnboardedUserProfile();
  const post = await getPostById(postId);

  if (!post) notFound();

  return (
    <section className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-5 flex items-center gap-3">
        <Link
          href={`/profile/${post.author.handle}`}
          className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors press"
        >
          <ArrowLeft size={17} strokeWidth={2} />
        </Link>
        <h1 className="text-[16px] font-semibold tracking-tight text-foreground">
          Post
        </h1>
      </div>
      <PostCard post={post} />
    </section>
  );
}

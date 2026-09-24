"use client";

import { UserDTO } from "@/lib/actions/users";
import { toggleFollowAction } from "@/lib/actions/follows";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import ProfilePhoto from "@/components/shared/ProfilePhoto";

export default function SearchResults({ users }: { users: UserDTO[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleFollow(userId: string) {
    startTransition(async () => {
      try {
        await toggleFollowAction(userId);
        router.refresh();
        toast.success("Updated");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed.");
      }
    });
  }

  if (users.length === 0) {
    return (
      <div className="surface-elevated p-8 text-center">
        <p className="text-[13px] text-muted-foreground">No people found.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {users.map((user) => (
        <div key={user.id} className="surface-elevated flex items-center gap-3 p-4">
          <ProfilePhoto src={user.avatarUrl} name={user.name} />
          <div className="min-w-0 flex-1">
            <Link
              href={`/profile/${user.handle}`}
              className="text-[14px] font-semibold text-foreground hover:text-primary transition-colors"
            >
              {user.name}
            </Link>
            <p className="truncate text-[12.5px] text-muted-foreground">
              {user.headline || `@${user.handle}`}
            </p>
            {user.institution && (
              <p className="truncate text-[12px] text-muted-foreground">
                {user.institution}
              </p>
            )}
          </div>
          <button
            onClick={() => handleFollow(user.id)}
            disabled={isPending}
            className="btn-secondary press disabled:opacity-50"
          >
            Subscribe
          </button>
        </div>
      ))}
    </div>
  );
}

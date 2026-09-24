"use client";

import { toggleFollowAction } from "@/lib/actions/follows";
import { ProfileDTO, updateProfileAction } from "@/lib/actions/users";
import Link from "next/link";
import ProfilePhoto from "./shared/ProfilePhoto";
import { MapPin, Link as LinkIcon, Edit3, X } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

function StatCounter({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-[18px] font-semibold text-foreground font-mono tabular-nums">
        {value.toLocaleString()}
      </span>
      <span className="text-[12px] text-muted-foreground font-medium">
        {label}
      </span>
    </div>
  );
}

export default function ProfileHeader({ profile }: { profile: ProfileDTO }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await updateProfileAction(formData);
        toast.success("Profile updated");
        setIsEditing(false);
      } catch (err) {
        toast.error("Failed to update profile.");
      }
    });
  };

  return (
    <section className="surface-elevated overflow-hidden">
      {/* Banner — subtle, theme-aware */}
      <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-primary/15 via-primary/5 to-transparent">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 80% at 20% 100%, hsl(var(--primary) / 0.1) 0%, transparent 60%)",
          }}
        />
      </div>

      <div className="px-6 pb-6">
        <div className="-mt-14 flex flex-wrap items-end justify-between gap-4">
          <div className="rounded-full ring-4 ring-card bg-card">
            <ProfilePhoto
              src={profile.avatarUrl}
              name={profile.name}
              size="xl"
            />
          </div>

          <div className="flex gap-2">
            {!profile.isSelf ? (
              <form action={toggleFollowAction.bind(null, profile.id)}>
                <button
                  type="submit"
                  className={`press rounded-lg px-5 py-2 text-[13px] font-medium transition-all ${
                    profile.isSubscribed
                      ? "btn-secondary"
                      : "btn-primary"
                  }`}
                >
                  {profile.isSubscribed ? "Subscribed" : "Subscribe"}
                </button>
              </form>
            ) : (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="btn-secondary inline-flex items-center gap-1.5 press"
              >
                {isEditing ? (
                  <>
                    <X size={14} />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit3 size={14} />
                    Edit profile
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="mt-4">
          <h1 className="text-[28px] font-semibold tracking-tight text-foreground">
            {profile.name}
          </h1>
          <p className="mt-0.5 text-[14.5px] text-muted-foreground">
            {profile.headline || `@${profile.handle}`}
          </p>

          {(profile.location || profile.website) && (
            <div className="mt-3 flex flex-wrap items-center gap-4 text-[13px] text-muted-foreground">
              {profile.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={13} strokeWidth={2} />
                  {profile.location}
                </span>
              )}
              {profile.website && (
                <Link
                  href={profile.website}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-primary hover:underline"
                >
                  <LinkIcon size={13} strokeWidth={2} />
                  {profile.website.replace(/^https?:\/\//, "")}
                </Link>
              )}
            </div>
          )}

          {profile.bio && (
            <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-foreground/85">
              {profile.bio}
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-6">
            <StatCounter
              value={profile.subscriberCount}
              label="Subscribers"
            />
            <StatCounter
              value={profile.subscribingCount}
              label="Subscribing"
            />
            <StatCounter value={profile.postCount} label="Posts" />
          </div>
        </div>

        {/* Edit form */}
        {isEditing && (
          <div className="mt-6 rounded-xl border border-border bg-muted/30 p-5 animate-fade-up">
            <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Edit details
            </h3>
            <form
              onSubmit={handleEditSubmit}
              className="grid md:grid-cols-2 gap-4"
            >
              <label className="grid gap-1.5 text-[12px] font-medium text-foreground">
                Handle
                <input
                  name="handle"
                  defaultValue={profile.handle}
                  required
                  minLength={3}
                  maxLength={24}
                  className="input-base"
                />
              </label>
              <label className="grid gap-1.5 text-[12px] font-medium text-foreground">
                Headline
                <input
                  name="headline"
                  defaultValue={profile.headline}
                  maxLength={140}
                  className="input-base"
                />
              </label>
              <label className="grid gap-1.5 text-[12px] font-medium text-foreground md:col-span-2">
                Bio
                <textarea
                  name="bio"
                  defaultValue={profile.bio}
                  maxLength={500}
                  rows={4}
                  className="input-base resize-none"
                />
              </label>
              <label className="grid gap-1.5 text-[12px] font-medium text-foreground">
                Location
                <input
                  name="location"
                  defaultValue={profile.location}
                  maxLength={100}
                  className="input-base"
                />
              </label>
              <label className="grid gap-1.5 text-[12px] font-medium text-foreground">
                Website
                <input
                  name="website"
                  defaultValue={profile.website}
                  maxLength={180}
                  className="input-base"
                />
              </label>
              <div className="md:col-span-2 mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn-primary press disabled:opacity-50"
                >
                  {isPending ? "Saving…" : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}

"use client";

import {
  acceptConnectionAction,
  ConnectionDTO,
  declineConnectionAction,
  removeConnectionAction,
  sendConnectionRequestAction,
  SuggestionDTO,
} from "@/lib/actions/connections";
import ProfilePhoto from "@/components/shared/ProfilePhoto";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

function ConnectionCard({
  connection,
  showActions,
}: {
  connection: ConnectionDTO;
  showActions: "accept_decline" | "remove" | "none";
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function runAction(action: () => Promise<void>, success: string) {
    startTransition(async () => {
      try {
        await action();
        router.refresh();
        toast.success(success);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Action failed.");
      }
    });
  }

  return (
    <div className="surface-elevated flex items-start gap-3 p-4">
      <ProfilePhoto src={connection.user.avatarUrl} name={connection.user.name} />
      <div className="min-w-0 flex-1">
        <Link
          href={`/profile/${connection.user.handle}`}
          className="text-[14px] font-semibold text-foreground hover:text-primary transition-colors"
        >
          {connection.user.name}
        </Link>
        <p className="truncate text-[12.5px] text-muted-foreground">
          {connection.user.headline || `@${connection.user.handle}`}
        </p>
        {connection.user.institution && (
          <p className="truncate text-[12px] text-muted-foreground">
            {connection.user.institution}
          </p>
        )}
        {connection.note && (
          <p className="mt-2 text-[12px] text-foreground/75 italic">
            &ldquo;{connection.note}&rdquo;
          </p>
        )}
      </div>
      <div className="flex shrink-0 gap-2">
        {showActions === "accept_decline" && (
          <>
            <button
              onClick={() =>
                runAction(
                  () => acceptConnectionAction(connection.id),
                  "Connection accepted"
                )
              }
              disabled={isPending}
              className="btn-primary press disabled:opacity-50"
            >
              Accept
            </button>
            <button
              onClick={() =>
                runAction(
                  () => declineConnectionAction(connection.id),
                  "Request declined"
                )
              }
              disabled={isPending}
              className="btn-secondary press disabled:opacity-50"
            >
              Decline
            </button>
          </>
        )}
        {showActions === "remove" && (
          <button
            onClick={() =>
              runAction(
                () => removeConnectionAction(connection.id),
                "Connection removed"
              )
            }
            disabled={isPending}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-destructive hover:bg-destructive/10 hover:border-destructive/30 transition-all press disabled:opacity-50"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

function SuggestionCard({ suggestion }: { suggestion: SuggestionDTO }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleConnect() {
    startTransition(async () => {
      try {
        await sendConnectionRequestAction(suggestion.user.id);
        router.refresh();
        toast.success("Connection request sent");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed.");
      }
    });
  }

  return (
    <div className="surface-elevated flex items-start gap-3 p-4">
      <ProfilePhoto src={suggestion.user.avatarUrl} name={suggestion.user.name} />
      <div className="min-w-0 flex-1">
        <Link
          href={`/profile/${suggestion.user.handle}`}
          className="text-[14px] font-semibold text-foreground hover:text-primary transition-colors"
        >
          {suggestion.user.name}
        </Link>
        <p className="truncate text-[12.5px] text-muted-foreground">
          {suggestion.user.headline || `@${suggestion.user.handle}`}
        </p>
        <span className="mt-1.5 inline-block rounded-md border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
          {suggestion.reason}
        </span>
      </div>
      <button
        onClick={handleConnect}
        disabled={isPending}
        className="btn-secondary press disabled:opacity-50"
      >
        Connect
      </button>
    </div>
  );
}

const TABS = [
  { key: "requests", label: "Requests" },
  { key: "connections", label: "My Connections" },
  { key: "suggestions", label: "Suggestions" },
] as const;

export default function ConnectionsPage({
  requests,
  connections,
  suggestions,
  activeTab,
}: {
  requests: ConnectionDTO[];
  connections: ConnectionDTO[];
  suggestions: SuggestionDTO[];
  activeTab: string;
}) {
  return (
    <div>
      <div className="mb-5 border-b border-border flex gap-1">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Link
              key={tab.key}
              href={`/connections?tab=${tab.key}`}
              className={`relative px-4 py-2.5 text-[13.5px] font-medium transition-colors ${
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {tab.key === "requests" && requests.length > 0 && (
                <span className="ml-1.5 inline-grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground tabular-nums">
                  {requests.length}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-t-full" />
              )}
            </Link>
          );
        })}
      </div>

      {activeTab === "requests" && (
        <div className="grid gap-3">
          {requests.length === 0 ? (
            <div className="surface-elevated p-8 text-center">
              <p className="text-[13px] text-muted-foreground">
                No pending requests.
              </p>
            </div>
          ) : (
            requests.map((r) => (
              <ConnectionCard
                key={r.id}
                connection={r}
                showActions="accept_decline"
              />
            ))
          )}
        </div>
      )}

      {activeTab === "connections" && (
        <div className="grid gap-3">
          {connections.length === 0 ? (
            <div className="surface-elevated p-8 text-center">
              <p className="text-[13px] text-muted-foreground">
                No connections yet.
              </p>
            </div>
          ) : (
            connections.map((c) => (
              <ConnectionCard
                key={c.id}
                connection={c}
                showActions="remove"
              />
            ))
          )}
        </div>
      )}

      {activeTab === "suggestions" && (
        <div className="grid gap-3">
          {suggestions.length === 0 ? (
            <div className="surface-elevated p-8 text-center">
              <p className="text-[13px] text-muted-foreground">
                No suggestions right now.
              </p>
            </div>
          ) : (
            suggestions.map((s) => (
              <SuggestionCard key={s.user.id} suggestion={s} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

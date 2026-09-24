import NotificationList from "@/components/notifications/NotificationList";
import { getNotifications } from "@/lib/actions/notifications";
import { requireOnboardedUserProfile } from "@/lib/actions/users";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  await requireOnboardedUserProfile();
  const feed = await getNotifications();

  return (
    <section className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-[28px] font-semibold tracking-tight text-foreground">
        Notifications
      </h1>
      <NotificationList initialFeed={feed} />
    </section>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { NotificationCenter, notificationsQ } from "@/components/dash/notification-center";
export const Route = createFileRoute("/_authenticated/dashboard/notifications")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Notifications — Justdial dashboard" },
      {
        name: "description",
        content: "Manage notifications in your Justdial dashboard workspace.",
      },
      { property: "og:title", content: "Notifications — Justdial dashboard" },
      {
        property: "og:description",
        content: "Saved requests, accountable actions and real outcomes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <NotificationCenter staff={false} />,
});

import { NotificationExample } from "../components/NotificationExample";

export default function NotificationsPage(): JSX.Element {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Notifications Demo</h1>
      <p className="mb-4">
        This page demonstrates the notification system using WebSockets.
      </p>
      <NotificationExample />
    </div>
  );
}

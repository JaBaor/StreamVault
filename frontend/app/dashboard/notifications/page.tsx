"use client";

import { Button } from "@/components/ui/Button";
import { useUserData } from "@/contexts/UserDataContext";

export default function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead } =
    useUserData();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Notifications</h2>
        <Button variant="ghost" size="sm" onClick={markAllNotificationsRead}>
          Mark all read
        </Button>
      </div>
      <ul className="mt-4 space-y-3">
        {notifications.map((n) => (
          <li
            key={n.id}
            className={`rounded-xl border p-4 ${
              n.read
                ? "border-zinc-800 bg-zinc-900/30"
                : "border-[var(--sv-orange)]/30 bg-zinc-900/80"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-white">{n.title}</p>
                <p className="mt-1 text-sm text-zinc-400">{n.message}</p>
                <p className="mt-2 text-xs text-zinc-600">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
              {!n.read && (
                <button
                  type="button"
                  onClick={() => markNotificationRead(n.id)}
                  className="shrink-0 text-xs text-[var(--sv-orange)] hover:underline"
                >
                  Mark read
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useUserData } from "@/contexts/UserDataContext";
import { hasPremiumAccess } from "@/lib/access";
import { getCatalogAnime, getEpisodesForAnime } from "@/lib/catalog";

export default function DashboardPage() {
  const { user } = useAuth();
  const { watchlist, history, notifications } = useUserData();
  const all = getCatalogAnime();
  const canUseWatchlist = hasPremiumAccess(user);
  const unread = notifications.filter((n) => !n.read).length;
  const recent = history.slice(0, 3);

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <p className="text-sm text-zinc-500">Watchlist</p>
        <p className="mt-1 text-3xl font-bold text-white">
          {canUseWatchlist ? watchlist.length : "Premium"}
        </p>
        <Link
          href={canUseWatchlist ? "/dashboard/watchlist" : "/dashboard/subscription"}
          className="mt-2 text-sm text-[var(--sv-orange)]"
        >
          {canUseWatchlist ? "View all ->" : "Upgrade ->"}
        </Link>
      </div>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <p className="text-sm text-zinc-500">Watch history</p>
        <p className="mt-1 text-3xl font-bold text-white">{history.length}</p>
        <Link href="/dashboard/history" className="mt-2 text-sm text-[var(--sv-orange)]">
          Continue watching {"->"}
        </Link>
      </div>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <p className="text-sm text-zinc-500">Notifications</p>
        <p className="mt-1 text-3xl font-bold text-white">{unread} unread</p>
        <Link href="/dashboard/notifications" className="mt-2 text-sm text-[var(--sv-orange)]">
          Open {"->"}
        </Link>
      </div>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 sm:col-span-2 lg:col-span-3">
        <p className="text-sm font-semibold text-zinc-400">Plan</p>
        <p className="mt-1 text-lg capitalize text-white">
          {user?.subscriptionPlan ?? "free"} member
        </p>
        <Link
          href="/dashboard/subscription"
          className="mt-2 inline-block text-sm text-[var(--sv-orange)]"
        >
          Manage subscription {"->"}
        </Link>
      </div>
      {recent.length > 0 && (
        <div className="sm:col-span-2 lg:col-span-3">
          <h2 className="font-semibold text-white">Continue watching</h2>
          <ul className="mt-3 space-y-2">
            {recent.map((h) => {
              const anime = all.find((a) => a.id === h.animeId);
              const ep = getEpisodesForAnime(h.animeId).find((e) => e.id === h.episodeId);
              if (!anime || !ep) return null;
              return (
                <li key={`${h.animeId}-${h.episodeId}`}>
                  <Link
                    href={`/watch/${anime.id}/${ep.id}`}
                    className="flex items-center justify-between rounded-lg border border-zinc-800 px-4 py-3 hover:bg-zinc-900"
                  >
                    <span className="text-white">
                      {anime.title} - Ep {ep.number}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {Math.round(h.progress)}% watched
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

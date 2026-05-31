"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiFetch } from "@/lib/api";
import { hasPremiumAccess } from "@/lib/access";
import { getItem, setItem } from "@/lib/storage";
import type { Notification, WatchHistoryItem } from "@/lib/types";
import { useAuth } from "./AuthContext";

interface UserDataContextValue {
  watchlist: string[];
  history: WatchHistoryItem[];
  notifications: Notification[];
  toggleWatchlist: (animeId: string) => void;
  isInWatchlist: (animeId: string) => boolean;
  addToHistory: (item: Omit<WatchHistoryItem, "watchedAt">) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

const UserDataContext = createContext<UserDataContextValue | null>(null);

const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    title: "New episode available",
    message: "Blade Chronicle Episode 4 is now streaming.",
    read: false,
    createdAt: "2026-05-29T00:00:00.000Z",
  },
  {
    id: "n2",
    title: "Premium sale",
    message: "Get 30% off Premium this week only.",
    read: true,
    createdAt: "2026-05-28T00:00:00.000Z",
  },
];

function storageKey(userId: string | null, key: string) {
  return userId ? `${key}:${userId}` : key;
}

export function UserDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const uid = user?.id ?? null;
  const canUseWatchlist = hasPremiumAccess(user);

  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>(DEFAULT_NOTIFICATIONS);

  useEffect(() => {
    queueMicrotask(() => {
      setWatchlist(canUseWatchlist ? getItem(storageKey(uid, "watchlist"), []) : []);
      setHistory(getItem(storageKey(uid, "history"), []));
      if (uid) {
        setNotifications(getItem(storageKey(uid, "notifications"), DEFAULT_NOTIFICATIONS));
      }
    });
    if (uid && canUseWatchlist) {
      void apiFetch("/watchlist?limit=100", { _silent: true })
        .then((result) => {
          const ids = (result.data ?? []).map((movie: { movie_id: number | string }) =>
            String(movie.movie_id)
          );
          setWatchlist(ids);
          setItem(storageKey(uid, "watchlist"), ids);
        })
        .catch(() => undefined);
      void apiFetch("/watch-history?limit=100", { _silent: true })
        .then((result) => {
          const items = (result.data ?? []).map(
            (row: {
              movie_id: number | string;
              history_id?: number | string;
              progress_seconds?: number;
              watched_at?: string;
            }) => ({
              animeId: String(row.movie_id),
              episodeId: "full",
              progress: row.progress_seconds ?? 0,
              watchedAt: row.watched_at ?? new Date().toISOString(),
            })
          );
          setHistory(items);
          setItem(storageKey(uid, "history"), items);
        })
        .catch(() => undefined);
    }
  }, [uid, canUseWatchlist]);

  const persistWatchlist = useCallback(
    (next: string[]) => {
      setWatchlist(next);
      if (uid && canUseWatchlist) setItem(storageKey(uid, "watchlist"), next);
    },
    [uid, canUseWatchlist]
  );

  const toggleWatchlist = useCallback(
    (animeId: string) => {
      if (!canUseWatchlist) return;
      const inList = watchlist.includes(animeId);
      persistWatchlist(
        inList
          ? watchlist.filter((id) => id !== animeId)
          : [...watchlist, animeId]
      );
      if (uid && canUseWatchlist) {
        void apiFetch(`/watchlist/${animeId}`, {
          method: inList ? "DELETE" : "POST",
        }).catch(() => {
          persistWatchlist(watchlist);
        });
      }
    },
    [watchlist, persistWatchlist, uid, canUseWatchlist]
  );

  const isInWatchlist = useCallback(
    (animeId: string) => watchlist.includes(animeId),
    [watchlist]
  );

  const addToHistory = useCallback(
    (item: Omit<WatchHistoryItem, "watchedAt">) => {
      const entry: WatchHistoryItem = { ...item, watchedAt: new Date().toISOString() };
      const next = [
        entry,
        ...history.filter(
          (h) => !(h.animeId === item.animeId && h.episodeId === item.episodeId)
        ),
      ].slice(0, 50);
      setHistory(next);
      if (uid) setItem(storageKey(uid, "history"), next);
      if (uid) {
        void apiFetch("/watch-history", {
          method: "POST",
          body: JSON.stringify({
            movieId: Number(item.animeId),
            progressSeconds: Math.round(item.progress),
          }),
        }).catch(() => undefined);
      }
    },
    [history, uid]
  );

  const markNotificationRead = useCallback(
    (id: string) => {
      const next = notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      setNotifications(next);
      if (uid) setItem(storageKey(uid, "notifications"), next);
    },
    [notifications, uid]
  );

  const markAllNotificationsRead = useCallback(() => {
    const next = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(next);
    if (uid) setItem(storageKey(uid, "notifications"), next);
  }, [notifications, uid]);

  const value = useMemo(
    () => ({
      watchlist,
      history,
      notifications,
      toggleWatchlist,
      isInWatchlist,
      addToHistory,
      markNotificationRead,
      markAllNotificationsRead,
    }),
    [
      watchlist,
      history,
      notifications,
      toggleWatchlist,
      isInWatchlist,
      addToHistory,
      markNotificationRead,
      markAllNotificationsRead,
    ]
  );

  return (
    <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>
  );
}

export function useUserData() {
  const ctx = useContext(UserDataContext);
  if (!ctx) throw new Error("useUserData must be used within UserDataProvider");
  return ctx;
}

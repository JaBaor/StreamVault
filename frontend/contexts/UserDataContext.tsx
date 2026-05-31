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
  unreadCount: number;
}

const UserDataContext = createContext<UserDataContextValue | null>(null);

function storageKey(userId: string | null, key: string) {
  return userId ? `${key}:${userId}` : key;
}

export function UserDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const uid = user?.id ?? null;
  const canUseWatchlist = hasPremiumAccess(user);

  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setWatchlist(canUseWatchlist ? getItem(storageKey(uid, "watchlist"), []) : []);
      setHistory(getItem(storageKey(uid, "history"), []));
    });
    if (uid && canUseWatchlist) {
      apiFetch("/watchlist?limit=100", { _silent: true })
        .then((result) => {
          if (cancelled) return;
          const ids = (result.data ?? []).map((movie: { movie_id: number | string }) =>
            String(movie.movie_id)
          );
          setWatchlist(ids);
          setItem(storageKey(uid, "watchlist"), ids);
        })
        .catch(() => undefined);
      apiFetch("/watch-history?limit=100", { _silent: true })
        .then((result) => {
          if (cancelled) return;
          const items = (result.data ?? []).map(
            (row: { movie_id: number | string; progress_seconds?: number; watched_at?: string }) => ({
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
    if (uid) {
      apiFetch("/notifications?limit=50", { _silent: true })
        .then((result) => {
          if (cancelled) return;
          const items: Notification[] = (result.data ?? []).map(
            (n: { id: number; title: string; message: string; is_read: number; created_at: string }) => ({
              id: String(n.id),
              title: n.title,
              message: n.message ?? "",
              read: Boolean(n.is_read),
              createdAt: n.created_at,
            })
          );
          setNotifications(items);
          setItem(storageKey(uid, "notifications"), items);
          return apiFetch("/notifications/unread-count", { _silent: true });
        })
        .then((uc) => {
          if (cancelled || !uc) return;
          setUnreadCount(uc.count ?? 0);
        })
        .catch(() => {
          if (cancelled) return;
          const cached = getItem<Notification[]>(storageKey(uid, "notifications"), []);
          setNotifications(cached);
        });
    }
    return () => { cancelled = true; };
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
    async (id: string) => {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
      if (uid) {
        try {
          await apiFetch(`/notifications/${id}/read`, { method: "PUT" });
        } catch { /* ignore */ }
      }
    },
    [uid]
  );

  const markAllNotificationsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    if (uid) {
      try {
        await apiFetch("/notifications/read-all", { method: "PUT" });
      } catch { /* ignore */ }
    }
  }, [uid]);

  const value = useMemo(
    () => ({
      watchlist,
      history,
      notifications,
      unreadCount,
      toggleWatchlist,
      isInWatchlist,
      addToHistory,
      markNotificationRead,
      markAllNotificationsRead,
    }),
    [
      watchlist, history, notifications, unreadCount,
      toggleWatchlist, isInWatchlist, addToHistory,
      markNotificationRead, markAllNotificationsRead,
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

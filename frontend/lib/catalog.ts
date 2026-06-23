import {
  animeList as baseAnime,
  episodes as baseEpisodes,
  genres as baseGenres,
} from "./mock-data";
import { API_URL, apiFetch, getAccessToken } from "./api";
import { getItem, setItem } from "./storage";
import type { Anime, Episode, Genre, RatingStats, Review } from "./types";

type BackendMovie = {
  movie_id: number | string;
  title: string;
  description?: string | null;
  release_year?: number | string | null;
  duration?: number | string | null;
  poster_url?: string | null;
  banner_url?: string | null;
  trailer_url?: string | null;
  video_url?: string | null;
  storage_key?: string | null;
  view_count?: number | string | null;
  genre_id?: number | string | null;
  genre_name?: string | null;
  access_level?: string | null;
  type?: string | null;
  airing_status?: string | null;
};

type BackendGenre = {
  genre_id: number | string;
  name: string;
  description?: string | null;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeGoogleDriveUrl(url: string) {
  const match = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (match) return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
  return null;
}

function absoluteAsset(url?: string | null) {
  if (!url) return "/window.svg";
  const abyss = normalizeAbyssUrl(url);
  if (abyss) return abyss;
  const gdrive = normalizeGoogleDriveUrl(url);
  if (gdrive) return gdrive;
  if (/^https?:\/\//i.test(url) || url.startsWith("/") || url.startsWith("data:")) return url;
  const base = API_URL.replace(/\/api\/v1$/, "");
  return `${base}/${url.replace(/^\/+/, "")}`;
}

function normalizeAbyssUrl(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  const match = trimmed.match(/^abyss:(.+)$/i);
  if (match) return `https://abyssplayer.com/${match[1]}`;
  if (/^(https?:\/\/)?(www\.)?(abyssplayer\.com|abyss\.to)\//i.test(trimmed)) {
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  }
  return null;
}

function normalizeBackendGenre(row: BackendGenre): Genre {
  const id = String(row.genre_id);
  return {
    id,
    slug: slugify(row.name) || id,
    name: row.name,
    description: row.description ?? undefined,
  };
}

function normalizeBackendMovie(row: BackendMovie): Anime {
  const id = String(row.movie_id);
  const genreIds = row.genre_id ? [String(row.genre_id)] : [];
  const views = Number(row.view_count ?? 0);
  const movieType = row.type?.toUpperCase() === "SERIES" ? "SERIES" : "MOVIE";
  return {
    id,
    slug: `${slugify(row.title) || "movie"}-${id}`,
    title: row.title,
    description: row.description || "No description available.",
    posterUrl: absoluteAsset(row.poster_url),
    _rawPosterUrl: row.poster_url,
    bannerUrl: absoluteAsset(row.banner_url || row.poster_url),
    rating: Math.max(0, Math.min(10, Number((views / 1000 + 7).toFixed(1)))),
    year: Number(row.release_year) || new Date().getFullYear(),
    status: row.airing_status === "ongoing" ? "ongoing" : "completed",
    genreIds,
    episodeCount: 1,
    isPremium: row.access_level === "premium" || row.access_level === "subscription",
    featured: views > 0,
    type: movieType,
    trailerUrl: absoluteAsset(row.trailer_url) || undefined,
  };
}

function uniqueById<T extends { id: string }>(items: T[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.id}:${"slug" in item ? String(item.slug) : ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function movieToEpisode(movie: BackendMovie | Anime): Episode {
  const isAnime = "posterUrl" in movie;
  const id = isAnime ? movie.id : String(movie.movie_id);
  const title = isAnime ? movie.title : movie.title;
  const duration = isAnime ? "Full movie" : String(movie.duration || "Full movie");
  const thumbnail = isAnime ? movie.posterUrl : absoluteAsset(movie.poster_url);
  const video =
    !isAnime && (movie.video_url || movie.storage_key)
      ? absoluteAsset(movie.video_url || movie.storage_key)
      : "";
  return {
    id: "full",
    animeId: id,
    number: 1,
    title,
    duration,
    videoUrl: video,
    thumbnailUrl: thumbnail,
    isPremium: isAnime ? movie.isPremium : movie.access_level === "premium",
  };
}

async function backendFetch<T>(endpoint: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    cache: "no-store",
    ...init,
  });
  if (!response.ok) throw new Error(`Backend request failed: ${endpoint}`);
  return response.json();
}

export function getCatalogAnime(): Anime[] {
  return getItem<Anime[]>("catalog-anime", baseAnime);
}

export function getCatalogEpisodes(): Episode[] {
  return getItem<Episode[]>("catalog-episodes", baseEpisodes);
}

export function getCatalogGenres(): Genre[] {
  return getItem<Genre[]>("catalog-genres", baseGenres);
}

export function saveCatalogAnime(list: Anime[]) {
  setItem("catalog-anime", list);
}

export function saveCatalogGenres(list: Genre[]) {
  setItem("catalog-genres", list);
}

export function getAnimeBySlug(slug: string) {
  return getCatalogAnime().find((a) => a.slug === slug || a.id === slug);
}

export function getAnimeById(id: string) {
  return getCatalogAnime().find((a) => a.id === id || a.slug === id);
}

export function getEpisodesForAnime(animeId: string) {
  return getCatalogEpisodes()
    .filter((e) => e.animeId === animeId)
    .sort((a, b) => a.number - b.number);
}

export function getEpisode(animeId: string, episodeId: string) {
  return getCatalogEpisodes().find(
    (e) => e.animeId === animeId && e.id === episodeId
  );
}

export function getGenreBySlug(slug: string) {
  return getCatalogGenres().find((g) => g.slug === slug);
}

export async function fetchCatalogAnime(): Promise<Anime[]> {
  try {
    const result = await backendFetch<{ data?: BackendMovie[] } | BackendMovie[]>(
      "/movies?limit=100"
    );
    const rows = Array.isArray(result) ? result : result.data ?? [];
    return uniqueById(rows.map(normalizeBackendMovie));
  } catch {
    return uniqueById(getCatalogAnime());
  }
}

export async function fetchCatalogGenres(): Promise<Genre[]> {
  try {
    const rows = await backendFetch<BackendGenre[]>("/genres");
    return uniqueById(rows.map(normalizeBackendGenre));
  } catch {
    return uniqueById(getCatalogGenres());
  }
}

export async function fetchAnimeBySlug(slug: string): Promise<Anime | undefined> {
  const id = slug.split("-").at(-1);
  if (id && /^\d+$/.test(id)) {
    try {
      const movie = await backendFetch<BackendMovie>(`/movies/${id}`);
      return normalizeBackendMovie(movie);
    } catch {
      return getAnimeBySlug(slug);
    }
  }
  const list = await fetchCatalogAnime();
  return list.find((a) => a.slug === slug || a.id === slug);
}

export async function fetchAnimeById(id: string): Promise<Anime | undefined> {
  try {
    const movie = await backendFetch<BackendMovie>(`/movies/${id}`);
    return normalizeBackendMovie(movie);
  } catch {
    return getAnimeById(id);
  }
}

export async function fetchEpisodesForAnime(animeId: string): Promise<Episode[]> {
  const anime = await fetchAnimeById(animeId);
  try {
    const result = await backendFetch<{ data: BackendEpisode[] }>(
      `/movies/${animeId}/episodes`
    );
    if (result.data && result.data.length > 0) {
      const isPremium = anime?.isPremium ?? false;
      return result.data.map((ep) => normalizeBackendEpisode(ep, isPremium));
    }
  } catch {}
  return anime ? [movieToEpisode(anime)] : getEpisodesForAnime(animeId);
}

export async function fetchWatchEpisode(
  animeId: string,
  episodeId?: string
): Promise<Episode | undefined> {
  const anime = await fetchAnimeById(animeId);
  if (!anime) return undefined;

  if (episodeId && episodeId !== "full") {
    const ep = await backendFetch<BackendEpisode>(
      `/movies/${animeId}/episodes/${episodeId}`
    );
    if (ep) {
      return { ...normalizeBackendEpisode(ep, anime.isPremium), animeId };
    }
  }

  const movie = await apiFetch(`/movies/${animeId}/watch`);
  return {
    ...movieToEpisode(anime),
    videoUrl: absoluteAsset(movie.videoUrl),
  };
}

type BackendEpisode = {
  episode_id: number | string;
  video_id: number | string;
  season_number: number;
  episode_number: number;
  title: string;
  description?: string | null;
  video_url?: string | null;
  storage_key?: string | null;
  thumbnail_url?: string | null;
  duration_seconds?: number | null;
};

function normalizeBackendEpisode(row: BackendEpisode, isPremium = false): Episode {
  const dur = row.duration_seconds ? `${Math.round(row.duration_seconds / 60)} min` : "Full movie";
  return {
    id: String(row.episode_id),
    animeId: String(row.video_id),
    number: row.episode_number,
    title: row.title,
    duration: dur,
    videoUrl: absoluteAsset(row.video_url || row.storage_key),
    thumbnailUrl: absoluteAsset(row.thumbnail_url),
    isPremium,
    description: row.description || undefined,
  };
}

export type MoviePayload = {
  title: string;
  description?: string;
  release_year?: number;
  duration?: number;
  poster_url?: string;
  trailer_url?: string;
  video_url?: string;
  access_level?: "free" | "premium";
  genre_id?: number;
  type?: "MOVIE" | "SERIES";
  airing_status?: "ongoing" | "completed";
};

export async function createMovie(payload: MoviePayload): Promise<Anime> {
  const movie = await apiFetch("/movies", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return normalizeBackendMovie(movie);
}

export async function updateMovie(id: string, payload: Partial<MoviePayload>): Promise<Anime> {
  const movie = await apiFetch(`/movies/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return normalizeBackendMovie(movie);
}

export async function deleteMovie(id: string): Promise<void> {
  await apiFetch(`/movies/${id}`, { method: "DELETE" });
}

export async function fetchRatingStats(movieId: string): Promise<RatingStats> {
  return apiFetch(`/movies/${movieId}/ratings`);
}

export async function fetchReviews(movieId: string): Promise<Review[]> {
  const result = await apiFetch(`/movies/${movieId}/reviews?limit=20`);
  return result.data ?? [];
}

export async function submitRating(movieId: string, rating: number): Promise<void> {
  await apiFetch(`/movies/${movieId}/rating`, {
    method: "POST",
    body: JSON.stringify({ rating }),
  });
}

export async function submitReview(movieId: string, comment: string, rating: number): Promise<void> {
  await apiFetch(`/movies/${movieId}/reviews`, {
    method: "POST",
    body: JSON.stringify({ comment, rating }),
  });
}

export type AdminUser = {
  user_id: number | string;
  username: string;
  email: string;
  role: "member" | "subscriber" | "admin";
  status: "active" | "deactivated";
  avatar_url?: string | null;
  created_at?: string;
};

function normalizeAdminUser(row: AdminUser & { role?: string; status?: string }): AdminUser {
  const role = String(row.role ?? "").toLowerCase();
  const status = String(row.status ?? "").toLowerCase();
  return {
    ...row,
    role: role === "admin" ? "admin" : role === "subscriber" ? "subscriber" : "member",
    status: status === "active" ? "active" : "deactivated",
  };
}

export type AdminStats = {
  totalUsers: number;
  totalMovies: number;
  totalGenres: number;
  viewsToday: number;
};

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const result = await apiFetch("/admin/users?limit=100");
  return (result.data ?? []).map(normalizeAdminUser);
}

export async function updateAdminUserRole(id: string, role: AdminUser["role"]) {
  return apiFetch(`/admin/users/${id}/role`, {
    method: "PUT",
    body: JSON.stringify({ role }),
  });
}

export async function updateAdminUserStatus(
  id: string,
  status: "active" | "deactivated"
) {
  return apiFetch(`/admin/users/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

export async function fetchAdminStats(): Promise<AdminStats> {
  return apiFetch("/admin/stats");
}

export type SubscriptionStatus = {
  plan: "free" | "premium_monthly" | "premium_yearly";
  isPremium: boolean;
  status: string;
  expiresAt: string | null;
  daysRemaining: number | null;
};

export async function fetchMySubscription(): Promise<SubscriptionStatus> {
  return apiFetch("/subscriptions/me");
}

export async function fetchSignupStats(period: string, from?: string, to?: string): Promise<{ date: string; signups: number }[]> {
  const params = new URLSearchParams({ period });
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  return apiFetch(`/admin/stats/signups?${params}`);
}

export async function fetchTopMovies(limit = 10): Promise<{ movie_id: number; title: string; view_count: number }[]> {
  return apiFetch(`/admin/stats/top-movies?limit=${limit}`);
}

export async function fetchSubscriptionPlanStats(): Promise<{ plan: string; count: number }[]> {
  return apiFetch("/admin/stats/subscription-plans");
}

export async function fetchNotifications(page = 1): Promise<{ data: { id: number; type: string; title: string; message: string; is_read: number; created_at: string }[]; total: number }> {
  return apiFetch(`/notifications?page=${page}`);
}

export async function markNotificationRead(id: number): Promise<void> {
  return apiFetch(`/notifications/${id}/read`, { method: "PUT" });
}

export async function markAllNotificationsRead(): Promise<void> {
  return apiFetch("/notifications/read-all", { method: "PUT" });
}

export async function fetchUnreadNotificationCount(): Promise<number> {
  const result = await apiFetch("/notifications/unread-count");
  return result.count;
}

export async function subscribeToSeries(movieId: string): Promise<void> {
  return apiFetch(`/movies/${movieId}/subscriptions/subscribe`, { method: "POST" });
}

export async function unsubscribeFromSeries(movieId: string): Promise<void> {
  return apiFetch(`/movies/${movieId}/subscriptions/unsubscribe`, { method: "POST" });
}

export async function fetchSeriesSubscriptionStatus(movieId: string): Promise<{ subscribed: boolean }> {
  return apiFetch(`/movies/${movieId}/subscriptions/status`);
}

export async function subscribeToPlan(
  plan: SubscriptionStatus["plan"]
): Promise<{ message: string; subscription: SubscriptionStatus }> {
  return apiFetch("/subscriptions", {
    method: "POST",
    body: JSON.stringify({ plan }),
  });
}

export async function cancelSubscription(): Promise<{
  message: string;
  subscription: SubscriptionStatus;
}> {
  return apiFetch("/subscriptions", { method: "DELETE" });
}

export function downloadCSV(endpoint: string, filename: string) {
  const token = getAccessToken();
  fetch(`${API_URL}${endpoint}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: "include",
  })
    .then((r) => {
      if (!r.ok) throw new Error("Export failed");
      return r.blob();
    })
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    })
    .catch((err) => console.error("CSV export error:", err));
}

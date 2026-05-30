import {
  animeList as baseAnime,
  episodes as baseEpisodes,
  genres as baseGenres,
} from "./mock-data";
import { API_URL, apiFetch } from "./api";
import { getItem, setItem } from "./storage";
import type { Anime, Episode, Genre } from "./types";

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
  view_count?: number | string | null;
  genre_id?: number | string | null;
  genre_name?: string | null;
  access_level?: string | null;
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

function absoluteAsset(url?: string | null) {
  if (!url) return "/window.svg";
  if (/^https?:\/\//i.test(url) || url.startsWith("/")) return url;
  const base = API_URL.replace(/\/api\/v1$/, "");
  return `${base}/${url.replace(/^\/+/, "")}`;
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
  return {
    id,
    slug: `${slugify(row.title) || "movie"}-${id}`,
    title: row.title,
    description: row.description || "No description available.",
    posterUrl: absoluteAsset(row.poster_url),
    bannerUrl: absoluteAsset(row.banner_url || row.poster_url),
    rating: Math.max(0, Math.min(10, Number((views / 1000 + 7).toFixed(1)))),
    year: Number(row.release_year) || new Date().getFullYear(),
    status: "completed",
    genreIds,
    episodeCount: 1,
    isPremium: row.access_level === "premium" || row.access_level === "subscription",
    featured: views > 0,
  };
}

function movieToEpisode(movie: BackendMovie | Anime): Episode {
  const isAnime = "posterUrl" in movie;
  const id = isAnime ? movie.id : String(movie.movie_id);
  const title = isAnime ? movie.title : movie.title;
  const duration = isAnime ? "Full movie" : String(movie.duration || "Full movie");
  const thumbnail = isAnime ? movie.posterUrl : absoluteAsset(movie.poster_url);
  const video = !isAnime && movie.video_url ? absoluteAsset(movie.video_url) : "";
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
    return rows.map(normalizeBackendMovie);
  } catch {
    return getCatalogAnime();
  }
}

export async function fetchCatalogGenres(): Promise<Genre[]> {
  try {
    const rows = await backendFetch<BackendGenre[]>("/genres");
    return rows.map(normalizeBackendGenre);
  } catch {
    return getCatalogGenres();
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
  return anime ? [movieToEpisode(anime)] : getEpisodesForAnime(animeId);
}

export async function fetchWatchEpisode(animeId: string): Promise<Episode | undefined> {
  const movie = await apiFetch(`/movies/${animeId}/watch`);
  const anime = await fetchAnimeById(animeId);
  if (!anime) return undefined;
  return {
    ...movieToEpisode(anime),
    videoUrl: absoluteAsset(movie.videoUrl),
  };
}

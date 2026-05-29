import {
  animeList as baseAnime,
  episodes as baseEpisodes,
  genres as baseGenres,
} from "./mock-data";
import { getItem, setItem } from "./storage";
import type { Anime, Episode, Genre } from "./types";

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

import type { Anime, Episode, Genre } from "./types";

/** Small CDN sample clips — low memory footprint */
export const SAMPLE_VIDEO =
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

export const genres: Genre[] = [
  { id: "g1", slug: "action", name: "Action", description: "High-energy battles and adventure." },
  { id: "g2", slug: "romance", name: "Romance", description: "Love stories and relationships." },
  { id: "g3", slug: "fantasy", name: "Fantasy", description: "Magic worlds and epic quests." },
  { id: "g4", slug: "comedy", name: "Comedy", description: "Laugh-out-loud moments." },
  { id: "g5", slug: "drama", name: "Drama", description: "Emotional storytelling." },
  { id: "g6", slug: "sci-fi", name: "Sci-Fi", description: "Future tech and space." },
];

const poster = (seed: string) =>
  `https://picsum.photos/seed/sv-${seed}/400/600`;
const banner = (seed: string) =>
  `https://picsum.photos/seed/sv-banner-${seed}/1280/720`;

export const animeList: Anime[] = [
  {
    id: "a1",
    slug: "blade-chronicle",
    title: "Blade Chronicle",
    titleJp: "ブレードクロニクル",
    description:
      "A fallen swordsman awakens ancient power to protect a kingdom on the brink of war.",
    posterUrl: poster("a1"),
    bannerUrl: banner("a1"),
    rating: 4.8,
    year: 2024,
    status: "ongoing",
    genreIds: ["g1", "g3"],
    episodeCount: 4,
    isPremium: false,
    featured: true,
  },
  {
    id: "a2",
    slug: "starlight-academy",
    title: "Starlight Academy",
    titleJp: "スターライトアカデミー",
    description:
      "Students compete in a magical school tournament where friendship becomes their greatest weapon.",
    posterUrl: poster("a2"),
    bannerUrl: banner("a2"),
    rating: 4.5,
    year: 2023,
    status: "completed",
    genreIds: ["g2", "g3", "g4"],
    episodeCount: 3,
    isPremium: true,
  },
  {
    id: "a3",
    slug: "neon-drift",
    title: "Neon Drift",
    description:
      "Street racers in a cyberpunk metropolis uncover a conspiracy tied to corporate AI.",
    posterUrl: poster("a3"),
    bannerUrl: banner("a3"),
    rating: 4.2,
    year: 2025,
    status: "ongoing",
    genreIds: ["g1", "g6"],
    episodeCount: 3,
    isPremium: false,
  },
  {
    id: "a4",
    slug: "sakura-whisper",
    title: "Sakura Whisper",
    description:
      "A shy florist learns to speak through music when cherry blossoms reveal hidden memories.",
    posterUrl: poster("a4"),
    bannerUrl: banner("a4"),
    rating: 4.7,
    year: 2022,
    status: "completed",
    genreIds: ["g2", "g5"],
    episodeCount: 3,
    isPremium: false,
  },
  {
    id: "a5",
    slug: "dungeon-gourmet",
    title: "Dungeon Gourmet",
    description:
      "Adventurers cook monsters they defeat — recipes unlock secret dungeon floors.",
    posterUrl: poster("a5"),
    bannerUrl: banner("a5"),
    rating: 4.6,
    year: 2024,
    status: "ongoing",
    genreIds: ["g3", "g4"],
    episodeCount: 3,
    isPremium: true,
  },
  {
    id: "a6",
    slug: "orbit-zero",
    title: "Orbit Zero",
    description:
      "The last space station crew must choose between Earth evacuation and saving an alien signal.",
    posterUrl: poster("a6"),
    bannerUrl: banner("a6"),
    rating: 4.4,
    year: 2023,
    status: "completed",
    genreIds: ["g5", "g6"],
    episodeCount: 2,
    isPremium: true,
  },
  {
    id: "a7",
    slug: "laugh-riot",
    title: "Laugh Riot Club",
    description:
      "A high school comedy club accidentally goes viral and must survive national fame.",
    posterUrl: poster("a7"),
    bannerUrl: banner("a7"),
    rating: 4.1,
    year: 2025,
    status: "ongoing",
    genreIds: ["g4"],
    episodeCount: 2,
    isPremium: false,
  },
  {
    id: "a8",
    slug: "iron-saga",
    title: "Iron Saga",
    description:
      "Mecha pilots defend coastal cities from deep-sea titans in this action epic.",
    posterUrl: poster("a8"),
    bannerUrl: banner("a8"),
    rating: 4.9,
    year: 2024,
    status: "ongoing",
    genreIds: ["g1", "g6"],
    episodeCount: 3,
    isPremium: false,
    featured: true,
  },
];

function buildEpisodes(animeId: string, count: number, premiumFrom = 2): Episode[] {
  return Array.from({ length: count }, (_, i) => {
    const n = i + 1;
    return {
      id: `${animeId}-ep${n}`,
      animeId,
      number: n,
      title: `Episode ${n}`,
      duration: `${22 + (n % 3)} min`,
      videoUrl: SAMPLE_VIDEO,
      thumbnailUrl: `https://picsum.photos/seed/sv-${animeId}-ep${n}/640/360`,
      isPremium: n >= premiumFrom,
    };
  });
}

export const episodes: Episode[] = animeList.flatMap((a) =>
  buildEpisodes(a.id, a.episodeCount, a.isPremium ? 2 : 99)
);

export function getAnimeById(id: string) {
  return animeList.find((a) => a.id === id || a.slug === id);
}

export function getAnimeBySlug(slug: string) {
  return animeList.find((a) => a.slug === slug);
}

export function getEpisodesForAnime(animeId: string) {
  return episodes.filter((e) => e.animeId === animeId).sort((a, b) => a.number - b.number);
}

export function getEpisode(animeId: string, episodeId: string) {
  return episodes.find((e) => e.animeId === animeId && e.id === episodeId);
}

export function getGenreBySlug(slug: string) {
  return genres.find((g) => g.slug === slug);
}

export function getGenresForAnime(anime: Anime) {
  return genres.filter((g) => anime.genreIds.includes(g.id));
}

export const DEMO_ACCOUNTS = [
  {
    email: "user@streamvault.dev",
    password: "user123",
    user: {
      id: "u1",
      email: "user@streamvault.dev",
      displayName: "Anime Fan",
      role: "subscriber" as const,
      subscriptionPlan: "premium" as const,
      subscriptionExpires: "2026-12-31",
    },
  },
  {
    email: "admin@streamvault.dev",
    password: "admin123",
    user: {
      id: "u2",
      email: "admin@streamvault.dev",
      displayName: "Admin",
      role: "admin" as const,
      subscriptionPlan: "premium" as const,
    },
  },
];

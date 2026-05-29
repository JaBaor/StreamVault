export type UserRole = "guest" | "subscriber" | "admin";

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  avatarUrl?: string;
  subscriptionPlan?: "free" | "premium";
  subscriptionExpires?: string;
}

export interface Genre {
  id: string;
  slug: string;
  name: string;
  description?: string;
}

export interface Episode {
  id: string;
  animeId: string;
  number: number;
  title: string;
  duration: string;
  videoUrl: string;
  thumbnailUrl: string;
  isPremium: boolean;
}

export interface Anime {
  id: string;
  slug: string;
  title: string;
  titleJp?: string;
  description: string;
  posterUrl: string;
  bannerUrl: string;
  rating: number;
  year: number;
  status: "ongoing" | "completed";
  genreIds: string[];
  episodeCount: number;
  isPremium: boolean;
  featured?: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface WatchHistoryItem {
  animeId: string;
  episodeId: string;
  progress: number;
  watchedAt: string;
}

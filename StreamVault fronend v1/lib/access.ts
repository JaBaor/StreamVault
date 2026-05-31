import type { Episode, User } from "./types";

export function hasPremiumAccess(user: User | null): boolean {
  return Boolean(
    user &&
      (user.subscriptionPlan === "premium" ||
        user.role === "subscriber" ||
        user.role === "admin")
  );
}

export function canWatchEpisode(
  episode: Episode,
  user: User | null,
  isSubscriber: boolean
): { allowed: boolean; reason?: "login" | "premium" | "subscriber" } {
  if (episode.isPremium) {
    if (!user) return { allowed: false, reason: "login" };
    if (!hasPremiumAccess(user)) return { allowed: false, reason: "premium" };
  }
  if (!episode.isPremium && !user && !isSubscriber) {
    return { allowed: true };
  }
  return { allowed: true };
}

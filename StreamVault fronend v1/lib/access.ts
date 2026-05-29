import type { Episode, User } from "./types";

export function canWatchEpisode(
  episode: Episode,
  user: User | null,
  isSubscriber: boolean
): { allowed: boolean; reason?: "login" | "premium" | "subscriber" } {
  if (episode.isPremium) {
    if (!user) return { allowed: false, reason: "login" };
    const hasPremium =
      user.subscriptionPlan === "premium" || user.role === "admin";
    if (!hasPremium) return { allowed: false, reason: "premium" };
  }
  if (!episode.isPremium && !user && !isSubscriber) {
    return { allowed: true };
  }
  return { allowed: true };
}

const subscriptionService = require("./subscriptionService");

function normalizeVideoUrl(movie) {
  const rawUrl = movie.video_url || "";
  const storageKey = movie.storage_key || "";

  if (/^https?:\/\//i.test(rawUrl)) return rawUrl;

  const abyssStorageMatch = storageKey.match(/^abyss:(.+)$/i);
  if (abyssStorageMatch) return `https://abyssplayer.com/${abyssStorageMatch[1]}`;

  const abyssUrlMatch = rawUrl.match(/^abyss:(.+)$/i);
  if (abyssUrlMatch) return `https://abyssplayer.com/${abyssUrlMatch[1]}`;

  return rawUrl;
}

async function canWatch(userId, movie) {
  const videoUrl = normalizeVideoUrl(movie);

  if (!userId) {
    if (movie.access_level === "premium") {
      return {
        allowed: false,
        code: "LOGIN_REQUIRED",
        message: "Please log in to watch this content",
        previewSeconds: 300,
      };
    }

    return {
      allowed: true,
      videoUrl,
      guestMode: true,
    };
  }

  const subscription = await subscriptionService.getStatus(userId);
  const requiresAgeConfirmation = Number.parseInt(movie.age_rating, 10) >= 17;

  if (movie.access_level === "premium") {
    if (!subscription.isPremium) {
      return {
        allowed: false,
        code: "PREMIUM_REQUIRED",
        message: "This content requires a Premium subscription",
        plans: Object.entries(subscriptionService.PLAN_CONFIG)
          .filter(([key]) => key !== "free")
          .map(([key, val]) => ({ plan: key, label: val.label })),
      };
    }

    if (subscription.isInGracePeriod) {
      return {
        allowed: true,
        videoUrl,
        subscription,
        warning: `Your subscription expired. You have ${subscription.graceDaysLeft} day(s) of grace period remaining.`,
        requiresAgeConfirmation,
      };
    }
  }

  return {
    allowed: true,
    videoUrl,
    subscription,
    requiresAgeConfirmation,
  };
}

module.exports = { canWatch };

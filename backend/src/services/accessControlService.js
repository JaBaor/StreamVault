// services/accessControlService.js

const subscriptionService = require("./subscriptionService");

// ── canWatch — the single source of truth for video access 

async function canWatch(userId, movie) {
  // ── Guest (not logged in) ────────────────────────────────────────────────
  if (!userId) {
    if (movie.access_level === "premium") {
      return {
        allowed:        false,
        code:           "LOGIN_REQUIRED",
        message:        "Please log in to watch this content",
        previewSeconds: 300,
      };
    }
    // Free movie, no login needed — but we still don't send video_url to guests
    // (they stream via the public trailer URL instead)
    return {
      allowed:   true,
      videoUrl:  movie.video_url,
      guestMode: true,
    };
  }

  // ── Logged-in user 
  const subscription = await subscriptionService.getStatus(userId);

  // Age rating check — extend this when you add user date_of_birth
  const requiresAgeConfirmation = movie.age_rating >= 17;

  // Premium movie
  if (movie.access_level === "premium") {
    if (!subscription.isPremium) {
      return {
        allowed: false,
        code:    "PREMIUM_REQUIRED",
        message: "This content requires a Premium subscription",
        plans:   Object.entries(subscriptionService.PLAN_CONFIG)
          .filter(([key]) => key !== "free")
          .map(([key, val]) => ({ plan: key, label: val.label })),
      };
    }

    // Premium user in grace period — allow but warn
    if (subscription.isInGracePeriod) {
      return {
        allowed:              true,
        videoUrl:             movie.video_url,
        subscription,
        warning:              `Your subscription expired. You have ${subscription.graceDaysLeft} day(s) of grace period remaining.`,
        requiresAgeConfirmation,
      };
    }
  }

  // Free movie OR premium user with active subscription
  return {
    allowed:  true,
    videoUrl: movie.video_url,
    subscription,
    requiresAgeConfirmation,
  };
}

module.exports = { canWatch };
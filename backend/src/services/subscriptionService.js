const subscriptionModel = require("../models/subscriptionModel");
const pool = require("../config/db");

// ── Plan config — durations and labels 
const PLAN_CONFIG = {
  free:            { durationDays: null, label: "Free"            },
  premium_monthly: { durationDays: 30,   label: "Premium Monthly" },
  premium_yearly:  { durationDays: 365,  label: "Premium Yearly"  },
};

const GRACE_PERIOD_DAYS = 3;

// ── Calculate expiry date for a plan 
function calcExpiresAt(plan) {
  const config = PLAN_CONFIG[plan];
  if (!config || config.durationDays === null) return null; // free = no expiry

  const expires = new Date();
  expires.setDate(expires.getDate() + config.durationDays);
  return expires;
}

// ── Core: interpret a raw subscription row into a status object ───────────────

function interpretStatus(row) {
  // No subscription row → treat as free
  if (!row || row.plan === "free") {
    return {
      plan:            "free",
      isPremium:       false,
      status:          "free",
      expiresAt:       null,
      daysRemaining:   null,
      isInGracePeriod: false,
    };
  }

  const now            = new Date();
  const expiresAt      = new Date(row.expires_at);
  const gracePeriodEnd = new Date(
    expiresAt.getTime() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000
  );

  // Still within the paid window
  if (now <= expiresAt) {
    const daysRemaining = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
    return {
      plan:            row.plan,
      isPremium:       true,
      status:          "active",
      expiresAt,
      daysRemaining,
      isInGracePeriod: false,
    };
  }

  
  if (now <= gracePeriodEnd) {
    const graceDaysLeft = Math.ceil(
      (gracePeriodEnd - now) / (1000 * 60 * 60 * 24)
    );
    return {
      plan:            row.plan,
      isPremium:       true,           // ← still has access
      status:          "grace_period",
      expiresAt,
      gracePeriodEnd,
      graceDaysLeft,
      isInGracePeriod: true,
    };
  }

  // Fully expired — no more premium access
  return {
    plan:            row.plan,
    isPremium:       false,
    status:          "expired",
    expiresAt,
    daysRemaining:   0,
    isInGracePeriod: false,
  };
}

// ── Public API

async function getStatus(userId) {
  const row = await subscriptionModel.getByUserId(userId);
  return interpretStatus(row);
}

async function subscribe(userId, plan) {
  if (plan === "free") {
    // Subscribing to free = cancelling
    await subscriptionModel.cancel(userId);
    await pool.query("UPDATE Users SET role = 'member' WHERE user_id = ? AND role = 'subscriber'", [userId]);
    return getStatus(userId);
  }

  const expiresAt = calcExpiresAt(plan);
  await subscriptionModel.upsert(userId, plan, expiresAt);
  await pool.query("UPDATE Users SET role = 'subscriber' WHERE user_id = ? AND role = 'member'", [userId]);
  return getStatus(userId);
}

async function cancel(userId) {
  await subscriptionModel.cancel(userId);
  await pool.query("UPDATE Users SET role = 'member' WHERE user_id = ? AND role = 'subscriber'", [userId]);
  return getStatus(userId);
}

module.exports = { getStatus, subscribe, cancel, PLAN_CONFIG };

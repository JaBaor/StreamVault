const subscriptionService  = require("../services/subscriptionService");
const { BadRequestError }  = require("../errors/errors");

// ── GET /api/v1/subscriptions/me 
exports.getMySubscription = async (req, res) => {
  const status = await subscriptionService.getStatus(req.user.id);
  res.json(status);
};

// ── POST /api/v1/subscriptions — subscribe or upgrade/downgrade ───────────────
exports.subscribe = async (req, res) => {
  const { plan } = req.body;
  const current  = await subscriptionService.getStatus(req.user.id);

  if (current.plan === plan && current.status === "active") {
    throw new BadRequestError(`You are already on the ${plan} plan`);
  }

  const result = await subscriptionService.subscribe(req.user.id, plan);

  res.json({
    message: plan === "free"
      ? "Downgraded to free plan"
      : `Subscribed to ${plan} successfully`,
    subscription: result,
  });
};

// ── DELETE /api/v1/subscriptions — cancel, revert to free 
exports.cancel = async (req, res) => {
  const current = await subscriptionService.getStatus(req.user.id);

  if (current.plan === "free") {
    throw new BadRequestError("You have no active subscription to cancel");
  }

  const result = await subscriptionService.cancel(req.user.id);
  res.json({ message: "Subscription cancelled. Reverted to free plan.", subscription: result });
};
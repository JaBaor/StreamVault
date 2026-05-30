const { body } = require("express-validator");
const { PLAN_CONFIG } = require("../../services/subscriptionService");

const VALID_PLANS = Object.keys(PLAN_CONFIG);

exports.subscribePlanRules = [
  body("plan")
    .isIn(VALID_PLANS)
    .withMessage(`Plan must be one of: ${VALID_PLANS.join(", ")}`),
];
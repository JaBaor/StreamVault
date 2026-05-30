const { param, body, query } = require("express-validator");

const VALID_ROLES    = ["member", "admin"];
const VALID_STATUSES = ["active", "deactivated"];
const VALID_PERIODS  = ["week", "month"];
const VALID_ACTIONS  = ["CREATE", "UPDATE", "DELETE", "ROLE_CHANGE",
                        "STATUS_CHANGE", "LOGIN", "LOGOUT"];

exports.userIdParam = [
  param("id")
    .isInt({ min: 1 }).withMessage("User ID must be a positive integer"),
];

exports.changeRoleRules = [
  body("role")
    .isIn(VALID_ROLES)
    .withMessage(`Role must be one of: ${VALID_ROLES.join(", ")}`),
];

exports.changeStatusRules = [
  body("status")
    .isIn(VALID_STATUSES)
    .withMessage(`Status must be one of: ${VALID_STATUSES.join(", ")}`),
];

exports.getUsersRules = [
  query("page")
    .optional()
    .isInt({ min: 1 }).withMessage("page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage("limit must be between 1 and 100"),
  query("search")
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage("search cannot exceed 100 characters"),
];

exports.signupStatsRules = [
  query("period")
    .optional()
    .isIn(VALID_PERIODS)
    .withMessage(`period must be one of: ${VALID_PERIODS.join(", ")}`),
];

exports.topMoviesRules = [
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage("limit must be between 1 and 50"),
];

exports.auditLogRules = [
  query("page")
    .optional()
    .isInt({ min: 1 }).withMessage("page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage("limit must be between 1 and 100"),
  query("userId")
    .optional()
    .isInt({ min: 1 }).withMessage("userId must be a positive integer"),
  query("action")
    .optional()
    .isIn(VALID_ACTIONS)
    .withMessage(`action must be one of: ${VALID_ACTIONS.join(", ")}`),
  query("entityType")
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage("entityType cannot exceed 50 characters"),
  query("startDate")
    .optional()
    .isISO8601().withMessage("startDate must be a valid date (YYYY-MM-DD)"),
  query("endDate")
    .optional()
    .isISO8601().withMessage("endDate must be a valid date (YYYY-MM-DD)"),
];
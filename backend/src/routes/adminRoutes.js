// routes/adminRoutes.js

const express    = require("express");
const router     = express.Router();
const ctrl       = require("../controllers/adminController");
const verifyToken = require("../middleware/verifyToken");
const adminAuth  = require("../middleware/adminAuth");
const validate   = require("../middleware/validate");
const {
  userIdParam,
  changeRoleRules,
  changeStatusRules,
  getUsersRules,
  signupStatsRules,
  topMoviesRules,
  auditLogRules,
} = require("../middleware/validators/adminValidators");

// Every admin route requires: valid JWT + admin role
router.use(verifyToken, adminAuth);

// ── User management 
router.get( "/users",
  getUsersRules, validate, ctrl.getUsers);

router.put( "/users/:id/role",
  userIdParam, changeRoleRules, validate, ctrl.changeRole);

router.put( "/users/:id/status",
  userIdParam, changeStatusRules, validate, ctrl.changeStatus);

router.get( "/users/:id/watch-history",
  userIdParam, validate, ctrl.getUserWatchHistory);

// ── Stats 
router.get( "/stats",
  ctrl.getStats);

router.get( "/stats/signups",
  signupStatsRules, validate, ctrl.getSignupStats);

router.get( "/stats/top-movies",
  topMoviesRules, validate, ctrl.getTopMovies);

router.get( "/stats/subscription-plans",
  ctrl.getSubscriptionPlanStats);

// ── Audit log 
router.get( "/audit-logs",
  auditLogRules, validate, ctrl.getAuditLogs);

module.exports = router;
const adminModel  = require("../models/adminModel");
const auditModel  = require("../models/auditModel");
const logAudit    = require("../utils/auditLog");
const { NotFoundError, BadRequestError } = require("../errors/errors");

// 
//  USER MANAGEMENT
// 

// ── GET /api/v1/admin/users 
exports.getUsers = async (req, res) => {
  const result = await adminModel.getUsers(req.query);
  res.json(result);
};

// ── PUT /api/v1/admin/users/:id/role 
exports.changeRole = async (req, res) => {
  const userId = Number(req.params.id);
  const { role } = req.body;

  // Prevent admin from demoting themselves
  if (userId === req.user.id) {
    throw new BadRequestError("You cannot change your own role");
  }

  const user = await adminModel.getUserById(userId);
  if (!user) throw new NotFoundError("User");

  if (user.role === role) {
    throw new BadRequestError(`User already has the role '${role}'`);
  }

  await adminModel.updateRole(userId, role);

  await logAudit({
    userId:     req.user.id,
    action:     "ROLE_CHANGE",
    entityType: "User",
    entityId:   userId,
    details:    { from: user.role, to: role, targetUsername: user.username },
  });

  res.json({ message: `Role updated to '${role}'`, userId, role });
};

// ── PUT /api/v1/admin/users/:id/status 
exports.changeStatus = async (req, res) => {
  const userId = Number(req.params.id);
  const { status } = req.body;

  // Prevent admin from deactivating themselves
  if (userId === req.user.id) {
    throw new BadRequestError("You cannot change your own account status");
  }

  const user = await adminModel.getUserById(userId);
  if (!user) throw new NotFoundError("User");

  if (user.status === status) {
    throw new BadRequestError(`User is already '${status}'`);
  }

  await adminModel.updateStatus(userId, status);

  await logAudit({
    userId:     req.user.id,
    action:     "STATUS_CHANGE",
    entityType: "User",
    entityId:   userId,
    details:    { from: user.status, to: status, targetUsername: user.username },
  });

  res.json({ message: `Status updated to '${status}'`, userId, status });
};

// ── GET /api/v1/admin/users/:id/watch-history 
exports.getUserWatchHistory = async (req, res) => {
  const user = await adminModel.getUserById(req.params.id);
  if (!user) throw new NotFoundError("User");

  const result = await adminModel.getUserWatchHistory(req.params.id, req.query);
  res.json(result);
};

// 
//  DASHBOARD STATS
// 

// ── GET /api/v1/admin/stats 
exports.getStats = async (req, res) => {
  const stats = await adminModel.getStats();
  res.json(stats);
};

// ── GET /api/v1/admin/stats/signups?period=week 
exports.getSignupStats = async (req, res) => {
  const data = await adminModel.getSignupStats(req.query.period, req.query.from, req.query.to);
  res.json(data);
};

// ── GET /api/v1/admin/stats/top-movies?limit=10 
exports.getTopMovies = async (req, res) => {
  const data = await adminModel.getTopMovies(req.query.limit);
  res.json(data);
};

// ── GET /api/v1/admin/stats/subscription-plans
exports.getSubscriptionPlanStats = async (req, res) => {
  const data = await adminModel.getSubscriptionPlanStats();
  res.json(data);
};

// 
//  AUDIT LOGS
// 

// ── GET /api/v1/admin/audit-logs 
exports.getAuditLogs = async (req, res) => {
  const result = await auditModel.getLogs(req.query);
  res.json(result);
};
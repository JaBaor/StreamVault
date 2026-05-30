const auditModel = require("../models/auditModel");

async function logAudit({ userId, action, entityType, entityId, details }) {
  try {
    await auditModel.createLog({ userId, action, entityType, entityId, details });
  } catch (err) {
    // Log to console but never propagate — audit failure must not affect the user
    console.error("[AuditLog] Failed to write log entry:", err.message);
  }
}

module.exports = logAudit;
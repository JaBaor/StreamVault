const pool = require("../config/db");

async function createLog({ userId, action, entityType, entityId, details }) {
  await pool.query(
    `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
     VALUES (?, ?, ?, ?, ?)`,
    [userId || null, action, entityType, entityId || null, details ? JSON.stringify(details) : null]
  );
}

async function getLogs({ page = 1, limit = 20, userId, action, entityType, startDate, endDate }) {
  const safeLimit = Math.min(Number(limit) || 20, 100);
  const offset = ((Number(page) || 1) - 1) * safeLimit;
  const conditions = [];
  const params = [];

  if (userId) {
    conditions.push("al.user_id = ?");
    params.push(Number(userId));
  }
  if (action) {
    conditions.push("al.action = ?");
    params.push(String(action).toUpperCase());
  }
  if (entityType) {
    conditions.push("al.entity_type = ?");
    params.push(entityType);
  }
  if (startDate) {
    conditions.push("al.performed_at >= ?");
    params.push(new Date(startDate));
  }
  if (endDate) {
    const end = new Date(endDate);
    end.setDate(end.getDate() + 1);
    conditions.push("al.performed_at < ?");
    params.push(end);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const [[logs], [[{ total }]]] = await Promise.all([
    pool.query(
      `SELECT al.id AS audit_id, al.action, al.entity_type, al.entity_id,
              al.details, al.performed_at AS created_at,
              u.id AS user_id, u.display_name AS username
       FROM audit_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ${whereClause}
       ORDER BY al.performed_at DESC
       LIMIT ? OFFSET ?`,
      [...params, safeLimit, offset]
    ),
    pool.query(`SELECT COUNT(*) AS total FROM audit_logs al ${whereClause}`, params),
  ]);

  return {
    data: logs,
    pagination: {
      total: Number(total),
      page: Number(page) || 1,
      limit: safeLimit,
      totalPages: Math.ceil(Number(total) / safeLimit),
    },
  };
}

module.exports = { createLog, getLogs };

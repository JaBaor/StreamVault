const pool = require("../config/db");

// ── INSERT a log entry 
async function createLog({ userId, action, entityType, entityId, details }) {
  await pool.query(
    `INSERT INTO Audit_Logs (user_id, action, entity_type, entity_id, details)
     VALUES (?, ?, ?, ?, ?)`,
    [
      userId     || null,
      action,
      entityType,
      entityId   || null,
      details ? JSON.stringify(details) : null,
    ]
  );
}

// ── GET paginated + filterable logs 
async function getLogs({ page = 1, limit = 20, userId, action, entityType, startDate, endDate }) {
  const offset     = (Number(page) - 1) * Number(limit);
  const conditions = [];
  const params     = [];

  if (userId) {
    conditions.push("al.user_id = ?");
    params.push(Number(userId));
  }
  if (action) {
    conditions.push("al.action = ?");
    params.push(action.toUpperCase());
  }
  if (entityType) {
    conditions.push("al.entity_type = ?");
    params.push(entityType);
  }
  if (startDate) {
    conditions.push("al.created_at >= ?");
    params.push(new Date(startDate));
  }
  if (endDate) {
    // Add 1 day so endDate is inclusive (covers the whole day)
    const end = new Date(endDate);
    end.setDate(end.getDate() + 1);
    conditions.push("al.created_at < ?");
    params.push(end);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [[logs], [[{ total }]]] = await Promise.all([
    pool.query(
      `SELECT al.audit_id, al.action, al.entity_type, al.entity_id,
              al.details, al.created_at,
              u.user_id, u.username
       FROM   Audit_Logs al
       LEFT JOIN Users u ON al.user_id = u.user_id
       ${whereClause}
       ORDER BY al.created_at DESC
       LIMIT  ? OFFSET ?`,
      [...params, Number(limit), offset]
    ),
    pool.query(
      `SELECT COUNT(*) AS total FROM Audit_Logs al ${whereClause}`,
      params
    ),
  ]);

  return {
    data: logs,
    pagination: {
      total:      Number(total),
      page:       Number(page),
      limit:      Number(limit),
      totalPages: Math.ceil(Number(total) / Number(limit)),
    },
  };
}

module.exports = { createLog, getLogs };
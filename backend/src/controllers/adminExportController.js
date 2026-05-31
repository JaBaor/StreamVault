const { Transform, Readable } = require("stream");
const pool = require("../config/db");

function escapeCSV(val) {
  if (val === null || val === undefined) return "";
  const s = String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function csvRow(fields) {
  return fields.map(escapeCSV).join(",") + "\r\n";
}

exports.exportUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, email, display_name, role, status, created_at FROM users ORDER BY id"
    );
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=users.csv");
    res.write(csvRow(["ID", "Email", "Display Name", "Role", "Status", "Created At"]));
    for (const r of rows) {
      res.write(csvRow([r.id, r.email, r.display_name, r.role, r.status, r.created_at]));
    }
    res.end();
  } catch (err) {
    console.error("CSV export error:", err);
    if (!res.headersSent) return res.status(500).json({ message: "Export failed" });
    res.end();
  }
};

exports.exportVideos = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, title, description, type,
              release_year, status, airing_status,
              view_count, age_rating, is_premium, created_at
       FROM videos ORDER BY id`
    );
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=videos.csv");
    res.write(csvRow([
      "ID", "Title", "Description", "Type",
      "Release Year", "Status", "Airing Status",
      "View Count", "Age Rating", "Is Premium",
      "Created At",
    ]));
    for (const r of rows) {
      res.write(csvRow([
        r.id, r.title, r.description, r.type,
        r.release_year, r.status, r.airing_status,
        r.view_count, r.age_rating, r.is_premium, r.created_at,
      ]));
    }
    res.end();
  } catch (err) {
    console.error("CSV export error:", err);
    if (!res.headersSent) return res.status(500).json({ message: "Export failed" });
    res.end();
  }
};

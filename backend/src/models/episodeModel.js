const pool = require("../config/db");

function normalizeVideoInput(value) {
  if (!value) return null;
  const trimmed = String(value).trim();
  const iframeSrc = trimmed.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  if (iframeSrc) return iframeSrc[1];

  const abyssMatch = trimmed.match(/^abyss:(.+)$/i);
  if (abyssMatch) return `abyss:${abyssMatch[1]}`;

  return trimmed;
}

function mapEpisode(row) {
  if (!row) return row;
  return {
    ...row,
    episode_id: row.episode_id ?? row.id,
  };
}

async function getEpisodesByVideoId(videoId) {
  const [rows] = await pool.query(
    `SELECT id, id AS episode_id, video_id, season_number, episode_number,
            title, description, video_url, storage_key, thumbnail_url,
            duration_seconds, status, created_at, updated_at
     FROM episodes
     WHERE video_id = ? AND status = 'ACTIVE'
     ORDER BY season_number, episode_number`,
    [videoId]
  );
  return rows.map(mapEpisode);
}

async function getEpisodeById(episodeId) {
  const [rows] = await pool.query(
    `SELECT id, id AS episode_id, video_id, season_number, episode_number,
            title, description, video_url, storage_key, thumbnail_url,
            duration_seconds, status, created_at, updated_at
     FROM episodes WHERE id = ? AND status = 'ACTIVE'`,
    [episodeId]
  );
  return mapEpisode(rows[0]);
}

async function createEpisode(fields) {
  const {
    video_id, season_number, episode_number, title, description,
    video_url, thumbnail_url, duration_seconds, duration,
  } = fields;

  const durSec = duration_seconds || (duration ? duration * 60 : null);

  const [result] = await pool.query(
    `INSERT INTO episodes
     (video_id, season_number, episode_number, title, description, video_url, thumbnail_url, duration_seconds, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')`,
    [
      video_id,
      season_number || 1,
      episode_number || 1,
      title,
      description || null,
      normalizeVideoInput(video_url),
      thumbnail_url || null,
      durSec,
    ]
  );

  return getEpisodeById(result.insertId);
}

async function updateEpisode(episodeId, fields) {
  const allowed = [
    "season_number", "episode_number", "title", "description",
    "video_url", "thumbnail_url", "duration_seconds",
  ];
  const aliases = { duration: "duration_seconds" };

  const normalized = { ...fields };
  for (const [from, to] of Object.entries(aliases)) {
    if (normalized[from] !== undefined && normalized[to] === undefined) {
      normalized[to] = from === "duration" ? normalized[from] * 60 : normalized[from];
    }
  }
  if (normalized.video_url !== undefined) {
    normalized.video_url = normalizeVideoInput(normalized.video_url);
  }

  const setClauses = [];
  const params = [];
  for (const key of allowed) {
    if (normalized[key] !== undefined) {
      setClauses.push(`${key} = ?`);
      params.push(normalized[key]);
    }
  }

  if (setClauses.length > 0) {
    await pool.query(
      `UPDATE episodes SET ${setClauses.join(", ")} WHERE id = ? AND status = 'ACTIVE'`,
      [...params, episodeId]
    );
  }

  return getEpisodeById(episodeId);
}

async function softDeleteEpisode(episodeId) {
  const [result] = await pool.query(
    "UPDATE episodes SET status = 'INACTIVE' WHERE id = ? AND status = 'ACTIVE'",
    [episodeId]
  );
  return result.affectedRows > 0;
}

module.exports = {
  getEpisodesByVideoId,
  getEpisodeById,
  createEpisode,
  updateEpisode,
  softDeleteEpisode,
};

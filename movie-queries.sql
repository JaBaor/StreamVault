-- =============================================================
-- MOVIE / TV SERIES SQL TEMPLATES
-- Run these directly in MySQL (phpMyAdmin, Workbench, etc.)
-- =============================================================

-- ---------------------------------------------------------
-- 1. ADD A NEW MOVIE
-- ---------------------------------------------------------
INSERT INTO videos (title, description, release_year, duration_seconds, thumbnail_url, trailer_url, video_url, type, airing_status, is_premium, status)
VALUES (
  'Movie Title Here',
  'Description here.',
  2025,
  7200,            -- 120 min * 60
  'https://example.com/thumbnail.jpg',
  'https://example.com/trailer.mp4',
  'https://example.com/video.mp4',
  'MOVIE',
  'completed',
  FALSE,           -- FALSE = free, TRUE = premium
  'ACTIVE'
);

-- Get the new video ID (needed to link a genre)
SELECT LAST_INSERT_ID();

-- Link a genre (replace 1 with the genre_id from the genres table)
INSERT INTO video_genres (video_id, genre_id)
VALUES (LAST_INSERT_ID(), 1);

-- ---------------------------------------------------------
-- 2. UPDATE A MOVIE
-- ---------------------------------------------------------
UPDATE videos
SET
  title           = 'New Title',
  description     = 'New description.',
  release_year    = 2025,
  duration_seconds = 9000,    -- 150 min * 60
  thumbnail_url   = 'https://example.com/new-thumb.jpg',
  trailer_url     = 'https://example.com/new-trailer.mp4',
  is_premium      = TRUE
WHERE id = 1;                 -- Replace 1 with the video ID

-- Update genre link (replace old genre with a new one)
DELETE FROM video_genres WHERE video_id = 1;
INSERT INTO video_genres (video_id, genre_id) VALUES (1, 2);

-- ---------------------------------------------------------
-- 3. ADD A TV SERIES (same as movie but type = 'SERIES')
-- ---------------------------------------------------------
INSERT INTO videos (title, description, release_year, thumbnail_url, type, airing_status, is_premium, status)
VALUES (
  'Series Title Here',
  'Description here.',
  2025,
  'https://example.com/thumbnail.jpg',
  'SERIES',
  'ongoing',       -- 'ongoing' or 'completed'
  TRUE,
  'ACTIVE'
);

-- Link a genre
INSERT INTO video_genres (video_id, genre_id)
VALUES (LAST_INSERT_ID(), 1);

-- ---------------------------------------------------------
-- 4. ADD AN EPISODE TO A TV SERIES
-- ---------------------------------------------------------
INSERT INTO episodes (video_id, season_number, episode_number, title, description, video_url, thumbnail_url, duration_seconds, status)
VALUES (
  1,                -- video_id of the parent series
  1,                -- season number
  1,                -- episode number
  'Episode Title',
  'Episode description.',
  'https://example.com/episode-video.mp4',
  'https://example.com/episode-thumb.jpg',
  1800,             -- 30 min * 60
  'ACTIVE'
);

-- ---------------------------------------------------------
-- 5. ADD MULTIPLE EPISODES AT ONCE
-- ---------------------------------------------------------
INSERT INTO episodes (video_id, season_number, episode_number, title, description, video_url, duration_seconds, status)
VALUES
  (1, 1, 1, 'Episode 1 Title', 'Description 1.', 'https://example.com/ep1.mp4', 1500, 'ACTIVE'),
  (1, 1, 2, 'Episode 2 Title', 'Description 2.', 'https://example.com/ep2.mp4', 1620, 'ACTIVE'),
  (1, 1, 3, 'Episode 3 Title', 'Description 3.', 'https://example.com/ep3.mp4', 1740, 'ACTIVE');

-- ---------------------------------------------------------
-- 6. UPDATE AN EPISODE
-- ---------------------------------------------------------
UPDATE episodes
SET
  title            = 'Updated Episode Title',
  description      = 'Updated description.',
  video_url        = 'https://example.com/updated-video.mp4',
  thumbnail_url    = 'https://example.com/updated-thumb.jpg',
  duration_seconds = 2000
WHERE id = 1;      -- episode ID

-- ---------------------------------------------------------
-- 7. QUICK REFERENCE: CHECK GENRE IDs
-- ---------------------------------------------------------
SELECT id, name FROM genres ORDER BY name;

-- ---------------------------------------------------------
-- 8. QUICK REFERENCE: CHECK VIDEO IDs
-- ---------------------------------------------------------
SELECT id, title, type FROM videos WHERE status = 'ACTIVE' ORDER BY title;

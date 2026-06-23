-- =============================================================
-- UPDATE SQL TEMPLATES — Movies, TV Series & Episodes
-- =============================================================

-- First, find the ID of the video you want to update
SELECT id, title, type FROM videos WHERE status = 'ACTIVE' ORDER BY title;

-- ---------------------------------------------------------
-- 1. UPDATE A MOVIE
-- ---------------------------------------------------------
UPDATE videos
SET
  title            = 'New Movie Title',
  description      = 'New description here.',
  release_year     = 2025,
  duration_seconds = 7200,           -- 120 min * 60
  thumbnail_url    = 'https://example.com/new-thumbnail.jpg',
  trailer_url      = 'https://example.com/new-trailer.mp4',
  video_url        = 'https://example.com/new-video.mp4',
  is_premium       = FALSE,          -- FALSE = free, TRUE = premium
  airing_status    = 'completed'     -- 'completed' or 'ongoing'
WHERE id = 1;                        -- ← replace with the movie ID

-- Update the genre link (replace 2 with the new genre_id)
DELETE FROM video_genres WHERE video_id = 1;
INSERT INTO video_genres (video_id, genre_id) VALUES (1, 2);

-- ---------------------------------------------------------
-- 2. UPDATE ONLY SPECIFIC FIELDS OF A MOVIE
--    (Any field you omit stays unchanged)
-- ---------------------------------------------------------
UPDATE videos
SET
  title         = 'Updated Title Only',
  is_premium    = TRUE
WHERE id = 1;

-- ---------------------------------------------------------
-- 3. UPDATE A TV SERIES (same as movie, type stays 'SERIES')
-- ---------------------------------------------------------
UPDATE videos
SET
  title            = 'New Series Title',
  description      = 'Updated series description.',
  airing_status    = 'ongoing',
  is_premium       = FALSE
WHERE id = 2;                        -- ← replace with the series ID

-- ---------------------------------------------------------
-- 4. FIND EPISODES FOR A SERIES
-- ---------------------------------------------------------
SELECT id, episode_number, title, duration_seconds, video_url
FROM episodes
WHERE video_id = 1 AND status = 'ACTIVE'   -- ← replace 1 with series ID
ORDER BY episode_number;

-- ---------------------------------------------------------
-- 5. UPDATE A SINGLE EPISODE
-- ---------------------------------------------------------
UPDATE episodes
SET
  episode_number   = 1,
  title            = 'Updated Episode Title',
  description      = 'Updated description.',
  video_url        = 'https://example.com/updated-episode.mp4',
  thumbnail_url    = 'https://example.com/updated-thumbnail.jpg',
  duration_seconds = 1800,           -- 30 min * 60
  season_number    = 1
WHERE id = 1;                        -- ← replace with the episode ID

-- ---------------------------------------------------------
-- 6. UPDATE MULTIPLE EPISODES AT ONCE
--    (e.g. renumber all episodes after inserting one)
-- ---------------------------------------------------------
UPDATE episodes
SET episode_number = episode_number + 1
WHERE video_id = 1 AND episode_number >= 3 AND status = 'ACTIVE';

-- ---------------------------------------------------------
-- 7. BULK UPDATE — change title prefix for a whole season
-- ---------------------------------------------------------
UPDATE episodes
SET title = REPLACE(title, 'Old Prefix', 'New Prefix')
WHERE video_id = 1 AND season_number = 1 AND status = 'ACTIVE';

-- ---------------------------------------------------------
-- 8. VERIFY YOUR CHANGES
-- ---------------------------------------------------------
-- Check the updated video
SELECT id, title, type, release_year, is_premium, airing_status
FROM videos WHERE id = 1;

-- Check episodes for a series
SELECT id, episode_number, title, duration_seconds, video_url
FROM episodes WHERE video_id = 1 AND status = 'ACTIVE' ORDER BY episode_number;

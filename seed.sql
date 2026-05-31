USE streaming_db;

-- Users (admin + subscriber + sample accounts)
-- Demo logins:
--   admin@streamify.com / Admin123!
--   user@streamvault.dev / User123!
--   moderator@streamvault.dev / User123!
INSERT INTO users (email, password_hash, display_name, role, status, email_verified) VALUES
('admin@streamify.com', '$2b$10$QDPpkzraRu3f96.vWRLTa.O9oWCOHLT1O1Vg2L9EJyTor9x0ZjfQO', 'Admin', 'ADMIN', 'ACTIVE', TRUE),
('user@streamvault.dev', '$2b$10$N9dMN.UfsZLmEkKI4/RDcuQYHve6yW0Q7SKQBLrBVjFwmyb4UK66i', 'Demo User', 'SUBSCRIBER', 'ACTIVE', TRUE),
('moderator@streamvault.dev', '$2b$10$N9dMN.UfsZLmEkKI4/RDcuQYHve6yW0Q7SKQBLrBVjFwmyb4UK66i', 'Mod User', 'MODERATOR', 'ACTIVE', TRUE);

-- Genres
INSERT INTO genres (name, slug, description) VALUES
('Action', 'action', 'High-energy battles and adventure'),
('Adventure', 'adventure', 'Epic journeys and exploration'),
('Comedy', 'comedy', 'Light-hearted and humorous'),
('Drama', 'drama', 'Emotional storytelling'),
('Fantasy', 'fantasy', 'Magic and mythical worlds'),
('Horror', 'horror', 'Dark and suspenseful'),
('Romance', 'romance', 'Love and relationships'),
('Sci-Fi', 'sci-fi', 'Futuristic technology and space'),
('Slice of Life', 'slice-of-life', 'Everyday life stories'),
('Sports', 'sports', 'Competitive athletics');

-- Subscriptions
INSERT INTO subscriptions (user_id, plan, status, start_date, end_date)
SELECT id, 'PREMIUM_MONTHLY', 'ACTIVE', NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY)
FROM users WHERE email = 'user@streamvault.dev';

INSERT INTO subscriptions (user_id, plan, status, start_date, end_date)
SELECT id, 'FREE', 'ACTIVE', NOW(), NULL
FROM users WHERE email = 'moderator@streamvault.dev';

-- Sample movie with Abyss player URL
INSERT INTO videos (title, description, thumbnail_url, video_url, storage_key, slug, type, release_year, duration_seconds, status, view_count, is_premium, created_by)
SELECT
  'The Angel Next Door Spoils Me Rotten',
  'Abyss-hosted sample movie for StreamVault playback demo.',
  'https://picsum.photos/seed/sv1/400/600',
  'abyss:FEOu638vC',
  'abyss:FEOu638vC',
  'thien-su-nha-ben',
  'MOVIE',
  2022,
  1440,
  'ACTIVE',
  1200,
  FALSE,
  u.id
FROM users u WHERE u.email = 'admin@streamify.com' LIMIT 1;

-- Link genre
INSERT INTO video_genres (video_id, genre_id)
SELECT v.id, g.id FROM videos v, genres g
WHERE v.slug = 'thien-su-nha-ben' AND g.slug = 'drama';

-- Run node seed-data.js for bulk video/episode/history seeding:
--   node seed-data.js

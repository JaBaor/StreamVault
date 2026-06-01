-- StreamVault complete schema + seed (MySQL 8+)
-- Run this once to initialize your Railway MySQL database.

CREATE DATABASE IF NOT EXISTS streaming_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE streaming_db;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS series_subscriptions;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS watchlist;
DROP TABLE IF EXISTS watch_history;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS video_genres;
DROP TABLE IF EXISTS episodes;
DROP TABLE IF EXISTS videos;
DROP TABLE IF EXISTS genres;
DROP TABLE IF EXISTS actors;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  avatar_url VARCHAR(500),
  bio TEXT,
  role ENUM('GUEST','SUBSCRIBER','MODERATOR','ADMIN') NOT NULL DEFAULT 'GUEST',
  status ENUM('ACTIVE','INACTIVE','BANNED') NOT NULL DEFAULT 'ACTIVE',
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  refresh_token VARCHAR(255),
  refresh_token_expires DATETIME,
  oauth_provider VARCHAR(20),
  oauth_id VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE genres (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE videos (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_url VARCHAR(500),
  trailer_url VARCHAR(500),
  video_url VARCHAR(500),
  storage_key VARCHAR(255),
  slug VARCHAR(255) UNIQUE,
  type ENUM('MOVIE','SERIES') NOT NULL DEFAULT 'MOVIE',
  airing_status ENUM('ongoing','completed') NOT NULL DEFAULT 'completed',
  release_year SMALLINT,
  duration_seconds INT,
  status ENUM('ACTIVE','INACTIVE','DRAFT') NOT NULL DEFAULT 'ACTIVE',
  view_count BIGINT NOT NULL DEFAULT 0,
  age_rating VARCHAR(10),
  is_premium BOOLEAN NOT NULL DEFAULT FALSE,
  created_by BIGINT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_videos_status_year (status, release_year),
  INDEX idx_videos_view_count (view_count DESC),
  FULLTEXT INDEX ft_videos_search (title, description)
);

CREATE TABLE episodes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  video_id BIGINT NOT NULL,
  season_number SMALLINT NOT NULL DEFAULT 1,
  episode_number SMALLINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url VARCHAR(500),
  storage_key VARCHAR(255),
  thumbnail_url VARCHAR(500),
  duration_seconds INT,
  status ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
  UNIQUE KEY uq_episode (video_id, season_number, episode_number),
  CHECK (episode_number > 0)
);

CREATE TABLE video_genres (
  video_id BIGINT NOT NULL,
  genre_id INT NOT NULL,
  PRIMARY KEY (video_id, genre_id),
  FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
  FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE RESTRICT,
  INDEX idx_vg_genre (genre_id)
);

CREATE TABLE subscriptions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  plan ENUM('FREE','PREMIUM_MONTHLY','PREMIUM_YEARLY') NOT NULL,
  status ENUM('ACTIVE','EXPIRED','CANCELLED') NOT NULL,
  start_date DATETIME NOT NULL,
  end_date DATETIME,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_sub_user_status (user_id, status, end_date)
);

CREATE TABLE watch_history (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  video_id BIGINT NOT NULL,
  episode_id BIGINT,
  progress_seconds INT NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  last_watched_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
  FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE SET NULL,
  UNIQUE KEY uq_history (user_id, video_id, episode_id),
  INDEX idx_wh_user_watched (user_id, last_watched_at DESC)
);

CREATE TABLE watchlist (
  user_id BIGINT NOT NULL,
  video_id BIGINT NOT NULL,
  added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, video_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
);

CREATE TABLE reviews (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  video_id BIGINT NOT NULL,
  rating TINYINT NOT NULL,
  review_text TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
  UNIQUE KEY uq_user_video (user_id, video_id),
  CHECK (rating BETWEEN 1 AND 5),
  INDEX idx_reviews_video (video_id)
);

CREATE TABLE audit_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id BIGINT,
  details JSON,
  performed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE notifications (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE actors (
  actor_id INT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(150) NOT NULL,
  nationality VARCHAR(100),
  birth_date DATE,
  bio TEXT,
  photo_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE series_subscriptions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  video_id BIGINT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
  UNIQUE KEY uq_series_sub (user_id, video_id)
);

-- ==================== SEED DATA ====================

-- Demo accounts:
--   admin@streamify.com / Admin123!
--   user@streamvault.dev / User123!
--   moderator@streamvault.dev / User123!
INSERT INTO users (email, password_hash, display_name, role, status, email_verified) VALUES
('admin@streamify.com', '$2b$10$QDPpkzraRu3f96.vWRLTa.O9oWCOHLT1O1Vg2L9EJyTor9x0ZjfQO', 'Admin', 'ADMIN', 'ACTIVE', TRUE),
('user@streamvault.dev', '$2b$10$N9dMN.UfsZLmEkKI4/RDcuQYHve6yW0Q7SKQBLrBVjFwmyb4UK66i', 'Demo User', 'SUBSCRIBER', 'ACTIVE', TRUE),
('moderator@streamvault.dev', '$2b$10$N9dMN.UfsZLmEkKI4/RDcuQYHve6yW0Q7SKQBLrBVjFwmyb4UK66i', 'Mod User', 'MODERATOR', 'ACTIVE', TRUE);

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

INSERT INTO subscriptions (user_id, plan, status, start_date, end_date)
SELECT id, 'PREMIUM_MONTHLY', 'ACTIVE', NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY)
FROM users WHERE email = 'user@streamvault.dev';

INSERT INTO subscriptions (user_id, plan, status, start_date, end_date)
SELECT id, 'FREE', 'ACTIVE', NOW(), NULL
FROM users WHERE email = 'moderator@streamvault.dev';

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

INSERT INTO video_genres (video_id, genre_id)
SELECT v.id, g.id FROM videos v, genres g
WHERE v.slug = 'thien-su-nha-ben' AND g.slug = 'drama';

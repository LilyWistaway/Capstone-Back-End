-- Wistaway Mini (Backend) - Database Schema
-- Tables:
-- users, categories, lodging_properties, playlists, playlist_lodgings, playlist_links

DROP TABLE IF EXISTS playlist_links;
DROP TABLE IF EXISTS playlist_lodgings;
DROP TABLE IF EXISTS playlists;
DROP TABLE IF EXISTS lodging_properties;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE lodging_properties (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  budget_tier INTEGER NOT NULL CHECK (budget_tier BETWEEN 1 AND 3),
  best_season TEXT NOT NULL,
  typical_stay_days INTEGER NOT NULL CHECK (typical_stay_days BETWEEN 1 AND 30),
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE playlists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE playlist_lodgings (
  playlist_id INTEGER NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  lodging_id INTEGER NOT NULL REFERENCES lodging_properties(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (playlist_id, lodging_id)
);

CREATE TABLE playlist_links (
  id SERIAL PRIMARY KEY,
  playlist_id INTEGER NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  link_type TEXT NOT NULL CHECK (link_type IN ('article', 'tiktok', 'youtube', 'other')),
  title TEXT,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Helpful indexes for common lookups
CREATE INDEX idx_lodging_properties_category_id ON lodging_properties(category_id);
CREATE INDEX idx_playlists_user_id ON playlists(user_id);
CREATE INDEX idx_playlist_links_playlist_id ON playlist_links(playlist_id);

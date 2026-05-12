-- Migration: Create initial core tables
-- Created: 2026-05-11

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  breed TEXT,
  age_group TEXT,
  weight_range TEXT,
  energy_level TEXT,
  size TEXT,
  temperament TEXT[],
  good_with_children BOOLEAN DEFAULT FALSE,
  good_with_pets BOOLEAN DEFAULT FALSE,
  house_trained BOOLEAN DEFAULT FALSE,
  special_needs TEXT,
  description TEXT,
  image_url TEXT,
  owner_id TEXT NOT NULL REFERENCES users(id),
  status TEXT DEFAULT 'available',
  state TEXT,
  adoptable_out_of_state BOOLEAN DEFAULT FALSE,
  only_pet BOOLEAN DEFAULT FALSE,
  ok_with_animals TEXT[],
  requires_fenced_yard BOOLEAN DEFAULT FALSE,
  needs_company BOOLEAN DEFAULT FALSE,
  comfortable_hours_alone TEXT,
  owner_experience_required TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_pet_applications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  pet_id TEXT NOT NULL REFERENCES pets(id),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, pet_id)
);

CREATE TABLE IF NOT EXISTS adopters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  location TEXT NOT NULL,
  distance_miles FLOAT,
  housing_type TEXT,
  has_yard BOOLEAN DEFAULT FALSE,
  experience_level TEXT,
  experience_description TEXT,
  family_adults INTEGER DEFAULT 1,
  family_children INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY,
  adopter_id TEXT NOT NULL REFERENCES adopters(id),
  pet_id TEXT NOT NULL REFERENCES pets(id),
  match_rank INTEGER,
  compatibility_score FLOAT,
  status TEXT DEFAULT 'pending',
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

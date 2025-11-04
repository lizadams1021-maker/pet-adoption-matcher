-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  location TEXT,
  housing_type TEXT,
  has_children BOOLEAN DEFAULT false,
  experience_level TEXT,
  activity_level TEXT,
  preferred_pet_size TEXT,
  preferred_temperament TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pets table
CREATE TABLE IF NOT EXISTS pets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  breed TEXT NOT NULL,
  age_group TEXT NOT NULL,
  weight_range TEXT NOT NULL,
  energy_level TEXT NOT NULL,
  size TEXT NOT NULL,
  temperament TEXT[] NOT NULL,
  good_with_children BOOLEAN DEFAULT false,
  good_with_pets BOOLEAN DEFAULT false,
  house_trained BOOLEAN DEFAULT false,
  special_needs BOOLEAN DEFAULT false,
  description TEXT,
  image_url TEXT,
  owner_id TEXT NOT NULL,
  status TEXT DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create adopters table
CREATE TABLE IF NOT EXISTS adopters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  location TEXT NOT NULL,
  distance_miles INTEGER,
  housing_type TEXT NOT NULL,
  has_yard BOOLEAN DEFAULT false,
  experience_level TEXT NOT NULL,
  experience_description TEXT,
  family_adults INTEGER DEFAULT 0,
  family_children INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY,
  adopter_id TEXT NOT NULL,
  pet_id TEXT NOT NULL,
  match_rank INTEGER NOT NULL,
  compatibility_score INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (adopter_id) REFERENCES adopters(id) ON DELETE CASCADE,
  FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
  UNIQUE(adopter_id, pet_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pets_owner_id ON pets(owner_id);
CREATE INDEX IF NOT EXISTS idx_pets_status ON pets(status);
CREATE INDEX IF NOT EXISTS idx_applications_pet_id ON applications(pet_id);
CREATE INDEX IF NOT EXISTS idx_applications_adopter_id ON applications(adopter_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

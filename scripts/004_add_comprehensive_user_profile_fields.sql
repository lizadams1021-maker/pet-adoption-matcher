-- Migration: Add comprehensive user profile fields from Excel intake form
-- This script adds all fields from the adoption application form to the users table

-- Add personal information fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS home_phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS cell_phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('M', 'F', 'Prefer not to answer'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS birthday DATE;

-- Add address fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS address_line TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS zip_code TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS willing_out_of_state BOOLEAN DEFAULT FALSE;

-- Add current pets information
ALTER TABLE users ADD COLUMN IF NOT EXISTS has_pets BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS pets_types TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS pets_good_with_others BOOLEAN;

-- Add housing information
ALTER TABLE users ADD COLUMN IF NOT EXISTS has_fenced_yard BOOLEAN;
ALTER TABLE users ADD COLUMN IF NOT EXISTS home_type TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS landlord_allows_pets BOOLEAN;
ALTER TABLE users ADD COLUMN IF NOT EXISTS landlord_phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS landlord_email TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS association_restrictions BOOLEAN;

-- Add work and pet care information
ALTER TABLE users ADD COLUMN IF NOT EXISTS works_outside_home BOOLEAN;
ALTER TABLE users ADD COLUMN IF NOT EXISTS hours_home_alone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS where_pets_when_away TEXT;

-- Add family information
ALTER TABLE users ADD COLUMN IF NOT EXISTS children_count INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS children_ages TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS adults_in_home INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS home_activity_level TEXT;

-- Add pet preferences
ALTER TABLE users ADD COLUMN IF NOT EXISTS pet_live_location TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS adoption_timeline TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_dog_breed TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_cat_type TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_age TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_weight TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_temperament_detailed TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_energy TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS undesired_characteristics TEXT[];

-- Add veterinary information
ALTER TABLE users ADD COLUMN IF NOT EXISTS take_pets_to_vet BOOLEAN;
ALTER TABLE users ADD COLUMN IF NOT EXISTS vet_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS vet_phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS vet_email TEXT;

-- Add references
ALTER TABLE users ADD COLUMN IF NOT EXISTS reference1_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reference1_phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reference1_email TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reference2_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reference2_phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reference2_email TEXT;

-- Add pet ownership history
ALTER TABLE users ADD COLUMN IF NOT EXISTS adopted_before BOOLEAN;
ALTER TABLE users ADD COLUMN IF NOT EXISTS owned_pet_before BOOLEAN;
ALTER TABLE users ADD COLUMN IF NOT EXISTS spayed_neutered BOOLEAN;
ALTER TABLE users ADD COLUMN IF NOT EXISTS vaccinated BOOLEAN;
ALTER TABLE users ADD COLUMN IF NOT EXISTS had_pets_no_longer_have TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS willing_behavior_training BOOLEAN;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reasons_give_up TEXT;

-- Add financial planning
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_for_vet_costs TEXT;

-- Add additional comments
ALTER TABLE users ADD COLUMN IF NOT EXISTS additional_comments TEXT;

-- Create indices for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_users_state ON users(state);
CREATE INDEX IF NOT EXISTS idx_users_city ON users(city);
CREATE INDEX IF NOT EXISTS idx_users_email_unique ON users(email);

-- Update existing users with safe defaults for new fields
UPDATE users SET 
  willing_out_of_state = COALESCE(willing_out_of_state, FALSE),
  has_pets = COALESCE(has_pets, FALSE)
WHERE willing_out_of_state IS NULL OR has_pets IS NULL;

-- Verification query to check new columns
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position;

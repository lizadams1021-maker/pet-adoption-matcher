-- Create user_pet_applications table to track adoption applications
-- This table links users (adopters) to pets they've applied for
CREATE TABLE IF NOT EXISTS user_pet_applications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  pet_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
  UNIQUE(user_id, pet_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_pet_applications_user_id ON user_pet_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_pet_applications_pet_id ON user_pet_applications(pet_id);

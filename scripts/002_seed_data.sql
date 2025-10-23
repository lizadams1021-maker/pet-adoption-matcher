-- Insert demo users
INSERT INTO users (id, email, password_hash, name, location, housing_type, has_children, experience_level, activity_level, preferred_pet_size, preferred_temperament, created_at)
VALUES 
  ('user-1', 'rescue@pawsandclaws.org', '$2a$10$rKZLvVZhVqKqY8Z8Z8Z8ZuKqY8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8', 'Paws & Claws Rescue', 'Austin, TX', 'rescue_center', false, 'expert', 'high', 'any', ARRAY['friendly', 'energetic', 'calm', 'playful'], NOW()),
  ('user-2', 'laura@example.com', '$2a$10$rKZLvVZhVqKqY8Z8Z8Z8ZuKqY8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8', 'Laura Martinez', 'Austin, TX', 'house', true, 'intermediate', 'moderate', 'medium', ARRAY['friendly', 'calm'], NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert demo pets
INSERT INTO pets (id, name, type, breed, age_group, weight_range, energy_level, size, temperament, good_with_children, good_with_pets, house_trained, special_needs, description, image_url, owner_id, status, created_at)
VALUES 
  ('pet-1', 'Max', 'dog', 'German Shepherd Mix', '3 years', '60-80 lbs', 'high', 'large', ARRAY['energetic', 'loyal', 'protective'], true, true, true, false, 'Max is an energetic and loyal German Shepherd mix looking for an active family.', '/german-shepherd.png', 'user-1', 'available', NOW()),
  ('pet-2', 'Luna', 'cat', 'Domestic Shorthair', '2 years', '8-12 lbs', 'moderate', 'medium', ARRAY['calm', 'independent', 'affectionate'], true, true, true, false, 'Luna is a sweet and independent cat who loves cozy spots and gentle pets.', '/orange-tabby-cat.png', 'user-1', 'available', NOW()),
  ('pet-3', 'Buddy', 'dog', 'Labrador Retriever', '5 years', '70-90 lbs', 'moderate', 'large', ARRAY['friendly', 'playful', 'gentle'], true, true, true, false, 'Buddy is a gentle giant who loves everyone he meets.', '/golden-retriever.png', 'user-1', 'available', NOW()),
  ('pet-4', 'Whiskers', 'cat', 'Maine Coon', '4 years', '15-20 lbs', 'low', 'large', ARRAY['calm', 'gentle', 'quiet'], true, true, true, false, 'Whiskers is a majestic Maine Coon with a calm demeanor.', '/maine-coon.png', 'user-1', 'available', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert demo adopters
INSERT INTO adopters (id, name, email, location, distance_miles, housing_type, has_yard, experience_level, experience_description, family_adults, family_children, verified, image_url, created_at)
VALUES 
  ('adopter-1', 'Sarah Johnson', 'sarah.j@example.com', 'Austin, TX', 0, 'house', true, 'experienced', '10+ years with large dogs', 2, 0, true, '/placeholder.svg?height=100&width=100', NOW()),
  ('adopter-2', 'Alicia Smith', 'alicia.s@example.com', 'Austin, TX', 5, 'house', true, 'experienced', '8+ years with multiple breeds', 2, 1, true, '/placeholder.svg?height=100&width=100', NOW()),
  ('adopter-3', 'Michael Chen', 'michael.c@example.com', 'Round Rock, TX', 15, 'apartment', false, 'intermediate', '5+ years with medium dogs', 1, 0, true, '/placeholder.svg?height=100&width=100', NOW()),
  ('adopter-4', 'Emily Rodriguez', 'emily.r@example.com', 'Cedar Park, TX', 12, 'house', true, 'beginner', 'First-time dog owner, completed training course', 2, 2, false, '/placeholder.svg?height=100&width=100', NOW()),
  ('adopter-5', 'David Thompson', 'david.t@example.com', 'Pflugerville, TX', 10, 'house', true, 'experienced', '15+ years with large breeds', 2, 0, true, '/placeholder.svg?height=100&width=100', NOW()),
  ('adopter-6', 'Jessica Park', 'jessica.p@example.com', 'Austin, TX', 3, 'townhouse', false, 'intermediate', '6+ years with cats and small dogs', 1, 1, true, '/placeholder.svg?height=100&width=100', NOW()),
  ('adopter-7', 'Robert Williams', 'robert.w@example.com', 'Georgetown, TX', 20, 'house', true, 'experienced', '20+ years with working dogs', 2, 3, true, '/placeholder.svg?height=100&width=100', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert demo applications (adopters applying for pets)
INSERT INTO applications (id, adopter_id, pet_id, match_rank, compatibility_score, status, applied_at)
VALUES 
  ('app-1', 'adopter-1', 'pet-1', 1, 90, 'pending', NOW() - INTERVAL '5 days'),
  ('app-2', 'adopter-2', 'pet-1', 2, 75, 'pending', NOW() - INTERVAL '4 days'),
  ('app-3', 'adopter-3', 'pet-1', 3, 68, 'pending', NOW() - INTERVAL '3 days'),
  ('app-4', 'adopter-4', 'pet-1', 4, 55, 'pending', NOW() - INTERVAL '2 days'),
  ('app-5', 'adopter-5', 'pet-1', 5, 85, 'pending', NOW() - INTERVAL '1 day'),
  ('app-6', 'adopter-6', 'pet-2', 1, 88, 'pending', NOW() - INTERVAL '6 days'),
  ('app-7', 'adopter-1', 'pet-2', 2, 72, 'pending', NOW() - INTERVAL '5 days'),
  ('app-8', 'adopter-7', 'pet-3', 1, 92, 'pending', NOW() - INTERVAL '7 days'),
  ('app-9', 'adopter-5', 'pet-3', 2, 80, 'pending', NOW() - INTERVAL '4 days'),
  ('app-10', 'adopter-2', 'pet-4', 1, 70, 'pending', NOW() - INTERVAL '3 days')
ON CONFLICT (adopter_id, pet_id) DO NOTHING;

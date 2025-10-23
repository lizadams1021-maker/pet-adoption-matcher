import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.NEON_NEON_DATABASE_URL!)

export { sql }

// Database types
export interface User {
  id: string
  email: string
  password_hash: string
  name: string
  location: string | null
  housing_type: string | null
  has_children: boolean
  experience_level: string | null
  activity_level: string | null
  preferred_pet_size: string | null
  preferred_temperament: string[] | null
  created_at: Date
  updated_at: Date
}

export interface Pet {
  id: string
  name: string
  type: string
  breed: string
  age_group: string
  weight_range: string
  energy_level: string
  size: string
  temperament: string[]
  good_with_children: boolean
  good_with_pets: boolean
  house_trained: boolean
  special_needs: boolean
  description: string | null
  image_url: string | null
  owner_id: string
  status: string
  created_at: Date
  updated_at: Date
}

export interface Adopter {
  id: string
  name: string
  email: string
  location: string
  distance_miles: number
  housing_type: string
  has_yard: boolean
  experience_level: string
  experience_description: string | null
  family_adults: number
  family_children: number
  verified: boolean
  image_url: string | null
  created_at: Date
  updated_at: Date
}

export interface Application {
  id: string
  adopter_id: string
  pet_id: string
  match_rank: number
  compatibility_score: number
  status: string
  applied_at: Date
  reviewed_at: Date | null
}

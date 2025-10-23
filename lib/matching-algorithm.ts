import type { User, Pet } from "./mock-data"

export interface MatchScore {
  petId: string
  score: number
  reasons: string[]
}

export function calculateCompatibility(user: User, pet: Pet): MatchScore {
  let score = 0
  const reasons: string[] = []
  const maxScore = 100

  // Experience level match (20 points)
  if (pet.requiresExperience && user.preferences.experienceLevel === "expert") {
    score += 20
    reasons.push("Your expert experience matches this pet's needs")
  } else if (pet.requiresExperience && user.preferences.experienceLevel === "experienced") {
    score += 15
    reasons.push("Your experience level is suitable for this pet")
  } else if (!pet.requiresExperience) {
    score += 20
    reasons.push("This pet is great for your experience level")
  } else {
    score += 5
  }

  // Housing compatibility (25 points)
  const housingScore = calculateHousingScore(user.preferences.housingType, pet.spaceNeeds)
  score += housingScore
  if (housingScore >= 20) {
    reasons.push("Your home is perfect for this pet's space needs")
  } else if (housingScore >= 15) {
    reasons.push("Your home meets this pet's space requirements")
  }

  // Activity level match (20 points)
  const activityScore = calculateActivityScore(user.preferences.activityLevel, pet.energyLevel)
  score += activityScore
  if (activityScore >= 15) {
    reasons.push("Your activity level matches this pet's energy perfectly")
  } else if (activityScore >= 10) {
    reasons.push("Your lifestyle suits this pet's energy level")
  }

  // Children compatibility (15 points)
  if (user.preferences.hasChildren && pet.goodWithKids) {
    score += 15
    reasons.push("Great with children - perfect for your family")
  } else if (!user.preferences.hasChildren) {
    score += 15
  } else if (user.preferences.hasChildren && !pet.goodWithKids) {
    score += 5
  }

  // Size preference (10 points)
  if (user.preferences.petSizePreference === "any" || user.preferences.petSizePreference === pet.size) {
    score += 10
    reasons.push("Size matches your preference")
  } else {
    score += 5
  }

  // Temperament match (10 points)
  const temperamentMatches = pet.temperament.filter((t) => user.preferences.temperamentPreference.includes(t)).length
  const temperamentScore = Math.min(10, temperamentMatches * 3)
  score += temperamentScore
  if (temperamentScore >= 8) {
    reasons.push("Temperament is an excellent match for you")
  }

  return {
    petId: pet.id,
    score: Math.min(maxScore, score),
    reasons,
  }
}

function calculateHousingScore(housingType: string, spaceNeeds: string): number {
  const compatibility: Record<string, Record<string, number>> = {
    apartment: {
      "apartment-ok": 25,
      "house-preferred": 15,
      "yard-required": 5,
    },
    "house-no-yard": {
      "apartment-ok": 25,
      "house-preferred": 25,
      "yard-required": 10,
    },
    "house-with-yard": {
      "apartment-ok": 25,
      "house-preferred": 25,
      "yard-required": 25,
    },
    farm: {
      "apartment-ok": 25,
      "house-preferred": 25,
      "yard-required": 25,
    },
  }
  return compatibility[housingType]?.[spaceNeeds] || 10
}

function calculateActivityScore(activityLevel: string, energyLevel: string): number {
  const compatibility: Record<string, Record<string, number>> = {
    low: {
      low: 20,
      moderate: 12,
      high: 5,
    },
    moderate: {
      low: 15,
      moderate: 20,
      high: 15,
    },
    high: {
      low: 10,
      moderate: 15,
      high: 20,
    },
  }
  return compatibility[activityLevel]?.[energyLevel] || 10
}

export function getMatchesForUser(user: User, pets: Pet[]): (Pet & { matchScore: MatchScore })[] {
  const matches = pets.map((pet) => ({
    ...pet,
    matchScore: calculateCompatibility(user, pet),
  }))

  return matches.sort((a, b) => b.matchScore.score - a.matchScore.score)
}

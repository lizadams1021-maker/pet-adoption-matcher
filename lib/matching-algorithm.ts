import type { User, Pet } from "./mock-data"

export interface MatchScore {
  petId: string
  score: number
  reasons: string[]
}

type Application = {
  user: any;
  pet: any;
};

type MatchResult = {
  petId: string;
  userId: string;
  score: number;
  reasons: string[];
  negativeReasons: string[];
};

export function calculateApplicationMatches(applications: Application[]): MatchResult[] {
  return applications.map(({ user, pet }) => {
    let score = 0;
    const reasons: string[] = [];
    const negativeReasons: string[] = [];
    const maxScore = 100;

    // --------------------
    // Children compatibility
    // --------------------
    if (pet.good_with_children) {
      if (user.children_count > 0) {
        score += 10;
        reasons.push("Pet is good with children, matching user's household.");
      } else {
        score += 5;
        reasons.push("Pet is good with children, user has no children.");
      }
    } else if (user.children_count > 0) {
      negativeReasons.push("Pet may not be suitable for homes with children.");
    } else {
      score += 5;
      reasons.push("No children in home, suitable for pet.");
    }

    // --------------------
    // Compatibility with other pets
    // --------------------
    if (!pet.good_with_pets) {
      if (user.has_pets && !user.pets_good_with_others) {
        negativeReasons.push("Pet may not be compatible with user's other pets.");
      } else {
        score += 5;
        reasons.push("User either has no pets or pets are good with others.");
      }
    } else {
      score += 10;
      reasons.push("Pet is good with other pets.");
    }

    // --------------------
    // House-trained
    // --------------------
    if (pet.house_trained) {
      score += 5;
      reasons.push("Pet is house-trained.");
    }

    // --------------------
    // Fenced yard requirement (high energy)
    // --------------------
    if (pet.energy_level === "high" || pet.requires_fenced_yard) {
      if (user.has_fenced_yard) {
        score += 10;
        reasons.push("User has a fenced yard, suitable for high-energy pet.");
      } else {
        score += 2;
        negativeReasons.push("High-energy pet or pet requiring fenced yard may not be ideal.");
      }
    } else {
      score += 5;
      reasons.push("Pet's energy level matches user's living situation.");
    }

    // --------------------
    // Special needs
    // --------------------
    if (pet.special_needs) {
      if (user.willing_behavior_training) {
        score += 10;
        reasons.push("User is willing to handle special needs of the pet.");
      } else {
        negativeReasons.push("User may not be prepared for this pet's special needs.");
      }
    }

    // --------------------
    // Out of state adoption
    // --------------------
    if (user.willing_out_of_state || pet.adoptable_out_of_state) {
      score += 5;
      reasons.push("User is willing to adopt out of state or pet is adoptable out of state.");
    }

    // --------------------
    // State compatibility
    // --------------------
    if (pet.state && user.state) {
      if (pet.state === user.state) {
        score += 5;
        reasons.push("Pet is in the same state as the user.");
      } else if (pet.adoptable_out_of_state) {
        score += 3;
        reasons.push("Pet is adoptable out of state and user is in a different state.");
      } else {
        negativeReasons.push("Pet is in a different state and is not adoptable out of state.");
      }
    }

    // --------------------
    // Age / breed / weight preference
    // --------------------
    if (user.preferred_age && user.preferred_age === pet.age_group) {
      score += 5;
      reasons.push("Pet's age matches user's preference.");
    }
    if (user.preferred_dog_breed && user.preferred_dog_breed === pet.breed) {
      score += 5;
      reasons.push("Pet's breed matches user's preference.");
    }
    if (user.preferred_weight && user.preferred_weight === pet.weight_range) {
      score += 5;
      reasons.push("Pet's weight matches user's preference.");
    }

    // --------------------
    // Temperament
    // --------------------
    const temperamentMatches = pet.temperament.filter((t: string) =>
      (user.preferred_temperament || []).includes(t)
    ).length;
    const temperamentScore = Math.min(10, temperamentMatches * 3);
    score += temperamentScore;
    if (temperamentScore >= 6) {
      reasons.push("Pet temperament aligns well with user's preference.");
    } else if (temperamentScore > 0) {
      reasons.push("Pet temperament partially matches user's preference.");
    } else {
      negativeReasons.push("Pet temperament may not match user's preference.");
    }

    // --------------------
    // Only pet requirement
    // --------------------
    if (pet.only_pet && user.has_pets) {
      negativeReasons.push("Pet prefers to be the only pet, but user already has pets.");
    } else if (!pet.only_pet && !user.has_pets) {
      score += 3;
      reasons.push("Pet is comfortable with other pets, user has no pets.");
    }

    // --------------------
    // Pet compatibility with user's pets (ok_with_animals)
    // --------------------
    if (pet.ok_with_animals !== null) {
      if (user.has_pets && pet.ok_with_animals) {
        score += 5;
        reasons.push("Pet is compatible with other animals.");
      } else if (user.has_pets && !pet.ok_with_animals) {
        negativeReasons.push("Pet may not be compatible with user's other animals.");
      }
    }

    // --------------------
    // Needs company / alone time
    // --------------------
    if (pet.needs_company) {
      if (user.works_outside_home && user.hours_home_alone !== null && user.hours_home_alone <= 4) {
        score += 5;
        reasons.push("User's home situation provides company for the pet.");
      } else {
        negativeReasons.push("Pet may not get enough company at user's home.");
      }
    }
    if (pet.comfortable_hours_alone !== null) {
      if (user.hours_home_alone !== null && user.hours_home_alone <= pet.comfortable_hours_alone) {
        score += 5;
        reasons.push("User's schedule aligns with pet's comfort being alone.");
      } else {
        negativeReasons.push("User may be away too long for pet's comfort.");
      }
    }

    // --------------------
    // Owner experience required
    // --------------------
    if (pet.owner_experience_required) {
      if (user.adopted_before || user.ownedPetBefore) {
        score += 5;
        reasons.push("User has prior pet experience suitable for this pet.");
      } else {
        negativeReasons.push("Pet may require more experienced owner.");
      }
    }

    // --------------------
    // Cap max score
    // --------------------
    score = Math.max(0, Math.min(maxScore, score));

    return {
      petId: pet.id,
      userId: user.id,
      score,
      reasons,
      negativeReasons,
    };
  });
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

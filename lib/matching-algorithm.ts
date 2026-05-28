import { User, Pet } from '@/lib/db';

export interface MatchScore {
  petId: string;
  score: number;
  reasons: string[];
  negativeReasons: string[];
}

export type Application = {
  user: User;
  pet: Pet;
};

export type MatchResult = {
  petId: string;
  userId: string;
  score: number;
  reasons: string[];
  negativeReasons: string[];
};

export function parseHoursRange(range: string | null | undefined): number | null {
  if (!range) return null;
  if (range.endsWith('+')) {
    return parseInt(range.replace('+', ''), 10);
  }
  const parts = range.split('-').map(Number);
  return parts[0];
}

/**
 * Core scoring logic shared between application matches and general compatibility checks.
 */
function calculateBaseCompatibility(
  user: User,
  pet: Pet
): { score: number; reasons: string[]; negativeReasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const negativeReasons: string[] = [];

  // Total potential positive points: ~150
  // We will normalize this to 0-100 at the end.

  // --------------------
  // Species compatibility
  // --------------------
  if (user.preferred_species) {
    const prefSpecies = user.preferred_species.toLowerCase();
    const petType = pet.type.toLowerCase();

    if (prefSpecies === 'cat' && petType !== 'cat') {
      return {
        score: 0,
        reasons: [],
        negativeReasons: [`Mismatch: You are looking for a cat, but this is a ${pet.type || 'other'}.`],
      };
    }
    if (prefSpecies === 'dog' && petType !== 'dog') {
      return {
        score: 0,
        reasons: [],
        negativeReasons: [`Mismatch: You are looking for a dog, but this is a ${pet.type || 'other'}.`],
      };
    }
    if (prefSpecies === 'other' && petType !== 'other') {
      return {
        score: 0,
        reasons: [],
        negativeReasons: [`Mismatch: You are looking for another species, but this is a ${pet.type || 'other'}.`],
      };
    }
    if (prefSpecies === petType || (prefSpecies === 'both' && (petType === 'cat' || petType === 'dog'))) {
      score += 15;
      reasons.push(`Matches your preferred species (${pet.type === 'cat' ? 'Cat' : pet.type === 'dog' ? 'Dog' : pet.type}).`);
    }
  }


  // --------------------
  // Children compatibility
  // --------------------
  if (pet.good_with_children) {
    if (user.has_children || (user.children_count && user.children_count > 0)) {
      score += 25;
      reasons.push('Pet is excellent for your household with children.');
    } else {
      score += 15;
      reasons.push('Pet is good with children (bonus for future flexibility).');
    }
  } else if (user.has_children || (user.children_count && user.children_count > 0)) {
    score -= 40;
    negativeReasons.push('Pet is not recommended for homes with children.');
  } else {
    score += 15;
    reasons.push('Safe match: No children in home and pet prefers it that way.');
  }

  // --------------------
  // Compatibility with other pets
  // --------------------
  const userHasPets = user.has_pets || (user.pets_types && user.pets_types.length > 0);
  if (pet.good_with_pets) {
    if (userHasPets) {
      score += 25;
      reasons.push('Pet is great with other animals, matching your current pets.');
    } else {
      score += 15;
      reasons.push('Pet is friendly with other animals.');
    }
  } else {
    if (userHasPets) {
      score -= 40;
      negativeReasons.push('Pet may not be compatible with your other pets.');
    } else {
      score += 15;
      reasons.push('Suitable for a single-pet household.');
    }
  }

  // --------------------
  // House-trained
  // --------------------
  if (pet.house_trained) {
    score += 10;
    reasons.push('Pet is already house-trained.');
  }

  // --------------------
  // Fenced yard requirement (high energy)
  // --------------------
  const highEnergy = pet.energy_level === 'high' || pet.energy_level === 'very high';
  const needsFencedYard =
    pet.requires_fenced_yard === true ||
    (pet.requires_fenced_yard !== null &&
      pet.requires_fenced_yard !== undefined &&
      highEnergy &&
      pet.type !== 'cat');

  if (needsFencedYard) {
    if (user.has_fenced_yard) {
      score += 20;
      reasons.push("Your fenced yard is perfect for this pet's energy level.");
    } else {
      score -= 20;
      negativeReasons.push('This pet requires a fenced yard or high activity space you may lack.');
    }
  } else {
    score += 10;
    reasons.push("Pet's energy level is a good match for your living situation.");
  }

  // --------------------
  // Special needs
  // --------------------
  if (pet.special_needs && pet.special_needs !== 'No' && pet.special_needs !== 'none') {
    if (user.willing_behavior_training || user.experience_level === 'advanced') {
      score += 25;
      reasons.push("You are well-prepared to handle this pet's special needs.");
    } else {
      score -= 30;
      negativeReasons.push('This pet has special needs that require experienced care.');
    }
  }

  // --------------------
  // Location & State compatibility
  // --------------------
  if (pet.state && user.state) {
    const petState = pet.state.toUpperCase();
    const userState = user.state.toUpperCase();
    if (petState === userState) {
      score += 15;
      reasons.push('Located in the same state, making adoption easier.');
    } else {
      // Different states
      if (!user.willing_out_of_state) {
        return {
          score: 0,
          reasons: [],
          negativeReasons: [`Mismatch: Pet is in ${pet.state}, but you prefer to adopt locally.`],
        };
      } else if (!pet.adoptable_out_of_state) {
        return {
          score: 0,
          reasons: [],
          negativeReasons: [`Mismatch: Rescue in ${pet.state} does not adopt out of state.`],
        };
      } else {
        score += 5;
        reasons.push('Out-of-state adoption is supported by both parties.');
      }
    }
  }

  // --------------------
  // Preferences (Age / Breed / Weight)
  // --------------------
  if (user.preferred_age && user.preferred_age === pet.age_group) {
    score += 10;
    reasons.push('Matches your preferred age group.');
  }
  if (user.preferred_dog_breed && user.preferred_dog_breed === pet.breed) {
    score += 10;
    reasons.push('Matches your preferred breed.');
  }
  if (user.preferred_weight && user.preferred_weight === pet.weight_range) {
    score += 10;
    reasons.push('Matches your preferred weight range.');
  }

  // --------------------
  // Schedule / Alone Time
  // --------------------
  const userHours = parseHoursRange(user.hours_home_alone);
  const petHours = parseHoursRange(pet.comfortable_hours_alone);

  if (userHours !== null && petHours !== null) {
    if (userHours <= petHours) {
      score += 15;
      reasons.push("Your schedule aligns perfectly with this pet's needs for company.");
    } else if (userHours > petHours + 2) {
      score -= 15;
      negativeReasons.push('Pet may be left alone longer than they are comfortable with.');
    }
  }

  // --------------------
  // Owner experience required
  // --------------------
  if (pet.owner_experience_required && pet.owner_experience_required !== 'none') {
    const hasExp =
      user.adopted_before ||
      user.owned_pet_before ||
      user.experience_level === 'intermediate' ||
      user.experience_level === 'advanced';
    if (hasExp) {
      score += 15;
      reasons.push('Your prior pet experience is a great asset for this pet.');
    } else {
      score -= 10;
      negativeReasons.push('This pet may require more experience than you currently have.');
    }
  }

  // --------------------
  // Bonded Pairs compatibility
  // --------------------
  const descriptionText = pet.description?.toLowerCase() || '';
  const isBondedPair =
    descriptionText.includes('bonded pair') ||
    descriptionText.includes('bonded sibling') ||
    (pet.temperament &&
      pet.temperament.some((t) => {
        const trait = t.toLowerCase();
        return trait.includes('bonded pair') || trait.includes('bonded');
      }));

  if (isBondedPair) {
    if (user.desired_pet_count === '2' || user.desired_pet_count === '3+') {
      score += 25;
      reasons.push('This pet is part of a bonded pair, matching your goal to adopt multiple pets!');
    } else if (user.desired_pet_count === '1') {
      return {
        score: 0,
        reasons: [],
        negativeReasons: [
          'Mismatch: This pet is part of a bonded pair, but you only want to adopt 1 pet.',
        ],
      };
    }
  }

  // Normalize score:
  // Base score can range from roughly -150 to +180.
  // We want to map this to 0-100.
  // A "neutral" score (just existence) would be around 40-50.

  let finalScore = 0;
  if (score > 0) {
    // If positive, scale towards 100. 150 raw points = ~95%
    finalScore = Math.min(100, 40 + (score / 150) * 60);
  } else {
    // If negative, scale towards 0. -100 raw points = 0%
    finalScore = Math.max(0, 40 + (score / 100) * 40);
  }

  return {
    score: Math.round(finalScore),
    reasons,
    negativeReasons,
  };
}

export function calculateApplicationMatches(applications: Application[]): MatchResult[] {
  return applications.map(({ user, pet }) => {
    const { score, reasons, negativeReasons } = calculateBaseCompatibility(user, pet);

    return {
      petId: pet.id,
      userId: user.id,
      score,
      reasons,
      negativeReasons,
    };
  });
}

export function calculateCompatibility(user: User, pet: Pet): MatchResult {
  const { score, reasons, negativeReasons } = calculateBaseCompatibility(user, pet);

  return {
    petId: pet.id,
    userId: user.id,
    score,
    reasons,
    negativeReasons,
  };
}

export function adjustScore(score: number) {
  // Legacy function for compatibility, now just returns the score
  return score;
}

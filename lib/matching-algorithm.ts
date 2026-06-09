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
  const reasons: string[] = [];
  const negativeReasons: string[] = [];

  // ==========================================
  // TIER 1: SAFETY & ABSOLUTE COMPATIBILITY
  // ==========================================

  // 1. Species Match Check
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
  }

  // 2. Child Safety Check (Comment [a])
  const adopterHasChildren = user.has_children || (user.children_count && user.children_count > 0);
  if (adopterHasChildren) {
    if (!pet.good_with_children) {
      return {
        score: 0,
        reasons: [],
        negativeReasons: ['Pet is not recommended for homes with children.'],
      };
    }

    const petMinAge = pet.children_min_age ?? 0;
    if (petMinAge > 0 && user.children_ages) {
      const ages = user.children_ages.split(',')
        .map(age => parseInt(age.trim(), 10))
        .filter(age => !isNaN(age));
      
      if (ages.length > 0) {
        const youngestChild = Math.min(...ages);
        if (youngestChild < petMinAge) {
          return {
            score: 0,
            reasons: [],
            negativeReasons: [`Pet requires children to be at least ${petMinAge} years old (youngest child is ${youngestChild}).`],
          };
        }
      }
    }
  }

  // 3. Animal Safety Check (Comment [b])
  const userHasPets = user.has_pets || (user.pets_types && user.pets_types.length > 0);
  if (userHasPets) {
    // Check if pet requires being the only pet
    if (pet.only_pet) {
      return {
        score: 0,
        reasons: [],
        negativeReasons: ['This pet must be the only pet in the household.'],
      };
    }

    // Check specific animal type compatibility
    if (user.pets_types && user.pets_types.length > 0 && pet.ok_with_animals && pet.ok_with_animals.length > 0) {
      const allowedSpecies = pet.ok_with_animals.map(s => s.toLowerCase());
      const userPetSpecies = user.pets_types.map(s => s.toLowerCase());

      const incompatibleSpecies = userPetSpecies.filter(species => !allowedSpecies.includes(species));
      if (incompatibleSpecies.length > 0) {
        return {
          score: 0,
          reasons: [],
          negativeReasons: [`Pet is not compatible with your existing ${incompatibleSpecies.join(', ')}s.`],
        };
      }
    }

    // Check general compatibility with pets
    if (!pet.good_with_pets) {
      return {
        score: 0,
        reasons: [],
        negativeReasons: ['Pet is not compatible with other animals.'],
      };
    }
  }

  // 4. Bonded Pairs Check
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
    if (user.desired_pet_count === '1') {
      return {
        score: 0,
        reasons: [],
        negativeReasons: [
          'Mismatch: This pet is part of a bonded pair, but you only want to adopt 1 pet.',
        ],
      };
    }
  }

  // 5. Interstate Policies Check (Comment [c])
  if (pet.state && user.state) {
    const petState = pet.state.toUpperCase();
    const userState = user.state.toUpperCase();
    if (petState !== userState) {
      if (!user.willing_out_of_state) {
        return {
          score: 0,
          reasons: [],
          negativeReasons: [`Mismatch: Pet is in ${pet.state}, but you prefer to adopt locally.`],
        };
      }
      if (!pet.adoptable_out_of_state) {
        return {
          score: 0,
          reasons: [],
          negativeReasons: [`Mismatch: Rescue in ${pet.state} does not adopt out of state.`],
        };
      }
    }
  }

  // ==========================================
  // TIER 2: LIFESTYLE & COEXISTENCE (Max 50 pts)
  // ==========================================
  let tier2Score = 0;

  // A. Energy level vs Fenced yard (20 pts)
  const highEnergy = pet.energy_level === 'high' || pet.energy_level === 'very high';
  const needsFencedYard =
    pet.requires_fenced_yard === true ||
    (pet.requires_fenced_yard !== null &&
      pet.requires_fenced_yard !== undefined &&
      highEnergy &&
      pet.type !== 'cat');

  if (needsFencedYard) {
    if (user.has_fenced_yard) {
      tier2Score += 20;
      reasons.push("Your fenced yard is perfect for this pet's energy level.");
    } else {
      negativeReasons.push('This pet requires a fenced yard or high activity space you may lack.');
    }
  } else {
    tier2Score += 20;
    reasons.push("Pet's energy level is a good match for your living situation.");
  }

  // B. Time Alone vs Pet Tolerance (15 pts)
  const userHours = parseHoursRange(user.hours_home_alone);
  const petHours = parseHoursRange(pet.comfortable_hours_alone);

  if (userHours !== null && petHours !== null) {
    if (userHours <= petHours) {
      tier2Score += 15;
      reasons.push("Your schedule aligns perfectly with this pet's needs for company.");
    } else if (userHours <= petHours + 2) {
      tier2Score += 10;
      reasons.push("Your schedule mostly aligns with this pet's needs for company.");
    } else {
      negativeReasons.push('Pet may be left alone longer than they are comfortable with.');
    }
  } else {
    tier2Score += 15; // default to full points if data is missing to avoid penalization
  }

  // C. Experience vs Pet Requirement (15 pts)
  if (pet.owner_experience_required && pet.owner_experience_required !== 'none') {
    const hasExp =
      user.adopted_before ||
      user.owned_pet_before ||
      user.experience_level === 'intermediate' ||
      user.experience_level === 'advanced';
    if (hasExp) {
      tier2Score += 15;
      reasons.push('Your prior pet experience is a great asset for this pet.');
    } else {
      negativeReasons.push('This pet may require more experience than you currently have.');
    }
  } else {
    tier2Score += 15;
    reasons.push('No special experience required, making this pet great for any household.');
  }

  // ==========================================
  // TIER 3: AESTHETIC PREFERENCES (Max 30 pts)
  // ==========================================
  let tier3Score = 0;

  // A. Age Preference (10 pts)
  if (user.preferred_age) {
    if (user.preferred_age.toLowerCase() === pet.age_group.toLowerCase()) {
      tier3Score += 10;
      reasons.push('Matches your preferred age group.');
    }
  } else {
    tier3Score += 10; // no preference = match
  }

  // B. Breed Preference (10 pts)
  if (user.preferred_dog_breed) {
    if (user.preferred_dog_breed.toLowerCase() === (pet.breed || '').toLowerCase()) {
      tier3Score += 10;
      reasons.push('Matches your preferred breed.');
    }
  } else {
    tier3Score += 10; // no preference = match
  }

  // C. Weight Preference (10 pts)
  if (user.preferred_weight) {
    if (user.preferred_weight.toLowerCase() === (pet.weight_range || '').toLowerCase()) {
      tier3Score += 10;
      reasons.push('Matches your preferred weight range.');
    }
  } else {
    tier3Score += 10; // no preference = match
  }

  // ==========================================
  // TIER 4: LOGISTICS & LOCATION (Max 20 pts)
  // ==========================================
  let tier4Score = 0;

  if (pet.state && user.state) {
    const petState = pet.state.toUpperCase();
    const userState = user.state.toUpperCase();
    if (petState === userState) {
      tier4Score += 20; // 15 pts Same State + 5 pts implicit logistics approval
      reasons.push('Located in the same state, making adoption logistics easier.');
    } else {
      tier4Score += 5; // Interstate approved
      reasons.push('Out-of-state adoption is supported by both parties.');
    }
  } else {
    tier4Score += 20; // Default if state not listed
  }

  // ==========================================
  // FINAL SCORE NORMALIZATION
  // ==========================================
  const finalScore = tier2Score + tier3Score + tier4Score; // Max possible = 50 + 30 + 20 = 100

  return {
    score: Math.min(100, Math.max(0, Math.round(finalScore))),
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



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

export function parseHoursRange(range: string | null): number | null {
  if (!range) return null;
  if (range.endsWith("+")) {
    return parseInt(range.replace("+", ""), 10);
  }
  const parts = range.split("-").map(Number);
  return parts[0]; // tomamos el valor mínimo del rango
}

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
    // State compatibility
    // --------------------
    if (pet.state && user.state) {
      if (pet.state === user.state) {
        score += 5;
        reasons.push("Pet is in the same state as the user.");
      } else if (pet.adoptable_out_of_state && user.willing_out_of_state) {
        score += 3;
        reasons.push("Pet is adoptable out of state and user is willing to adopt out of state.");
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
      const userHours = parseHoursRange(user.hours_home_alone);
      const petHours = parseHoursRange(pet.comfortable_hours_alone);

      if (
        user.works_outside_home &&
        userHours !== null &&
        petHours !== null &&
        userHours <= petHours
      ) {
        score += 5;
        reasons.push(
          `User's home situation provides company for ${pet.name} (user: ${userHours}h, pet comfortable: ${petHours}h).`
        );
      } else {
        negativeReasons.push(
          `${pet.name} may not get enough company at user's home (user: ${userHours}h, pet comfortable: ${petHours}h).`
        );
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

export function calculateCompatibility(user: any, pet: any): MatchResult {
  let score = 0;
  const reasons: string[] = [];
  const negativeReasons: string[] = [];
  const maxScore = 100;

  console.log("User data: ", user);
  console.log("pet data: ", pet);

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
  // State compatibility
  // --------------------
  if (pet.state && user.state) {
    if (pet.state === user.state) {
      score += 5;
      reasons.push("Pet is in the same state as the user.");
    } else if (pet.adoptable_out_of_state && user.willing_out_of_state) {
      score += 3;
      reasons.push("Pet is adoptable out of state and user is willing to adopt out of state.");
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
    if (user.has_pets) {
      score += 5;
      reasons.push("Pet is compatible with other animals.");
    } else if (user.has_pets && !pet.ok_with_animals) {
      negativeReasons.push("Pet may not be compatible with user's other animals.");
    }
  }

  // --------------------
  // Needs company / alone time
  // --------------------
    const userHours = parseHoursRange(user.hours_home_alone);
    const petHours = parseHoursRange(pet.comfortable_hours_alone);

    if (
      user.works_outside_home &&
      userHours !== null &&
      petHours !== null &&
      userHours <= petHours
    ) {
      score += 5;
      reasons.push(
        `User's home situation provides company for ${pet.name} (user: ${userHours}h, pet comfortable: ${petHours}h).`
      );
    } else {
      negativeReasons.push(
        `${pet.name} may not get enough company at user's home (user: ${userHours}h, pet comfortable: ${petHours}h).`
      );
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
  
}




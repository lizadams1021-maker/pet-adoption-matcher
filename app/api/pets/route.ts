import { type NextRequest, NextResponse } from 'next/server';
import { sql, type User, type Pet } from '@/lib/db';

async function ensureSpecialNeedsColumnSupportsText() {
  const columnInfo = await sql`
    SELECT data_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'pets'
      AND column_name = 'special_needs'
    LIMIT 1
  `;

  const currentType = columnInfo[0]?.data_type;

  if (currentType && currentType !== 'text') {
    try {
      await sql`
        ALTER TABLE pets
        ALTER COLUMN special_needs TYPE text
        USING CASE
          WHEN special_needs IS TRUE THEN 'Yes'
          WHEN special_needs IS FALSE THEN 'No'
          ELSE NULL
        END
      `;
    } catch (error) {
      console.error('[DB] Failed to alter special_needs column type:', error);
    }
  }
}

async function ensureChildrenMinAgeColumnExists() {
  try {
    await sql`
      ALTER TABLE pets ADD COLUMN IF NOT EXISTS children_min_age INTEGER DEFAULT 0
    `;
  } catch (error) {
    console.error('[DB] Failed to add children_min_age column:', error);
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensureChildrenMinAgeColumnExists();
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get('ownerId');
    const excludeOwnerId = searchParams.get('excludeOwnerId');

    const defaultLimit = 5;
    const limitParam = Number(searchParams.get('limit'));
    const pageParam = Number(searchParams.get('page'));
    const limit = !Number.isNaN(limitParam) && limitParam > 0 ? limitParam : defaultLimit;
    const page = !Number.isNaN(pageParam) && pageParam >= 0 ? pageParam : 0;
    const offset = page * limit;

    let pets;
    let totalCountResult;

    if (ownerId) {
      // If ownerId is present, paginate pets for that owner
      pets = await sql`
        SELECT 
          p.*, 
          u.name AS owner_name
        FROM pets p
        JOIN users u ON p.owner_id = u.id
        WHERE p.owner_id = ${ownerId}
        ORDER BY p.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      totalCountResult = await sql`
        SELECT COUNT(*)::int AS count
        FROM pets
        WHERE owner_id = ${ownerId}
      `;
    } else if (excludeOwnerId) {
      // 1. Fetch user profile
      const userResult = await sql`SELECT * FROM users WHERE id = ${excludeOwnerId} LIMIT 1`;
      if (userResult.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      const user = userResult[0] as User;

      // 2. Fetch only necessary columns for scoring to avoid "response too large" error
      const allPetsForScoring = await sql`
        SELECT 
          p.id, p.good_with_children, p.good_with_pets, p.house_trained, 
          p.energy_level, p.requires_fenced_yard, p.special_needs, p.state, 
          p.adoptable_out_of_state, p.age_group, p.breed, p.weight_range, 
          p.comfortable_hours_alone, p.owner_experience_required,
          p.type, p.description, p.temperament, p.created_at, p.only_pet, p.ok_with_animals, p.children_min_age,
          u.city AS owner_city, u.zip_code AS owner_zip
        FROM pets p
        JOIN users u ON p.owner_id = u.id
        WHERE p.owner_id != ${excludeOwnerId} AND p.status != 'adopted'
      `;

      // 3. Calculate scores, filter > 0, and sort
      const { calculateCompatibility } = await import('@/lib/matching-algorithm');

      const petsWithScores = allPetsForScoring
        .map((pet: any) => {
          const match = calculateCompatibility(user, pet as Pet);
          return { ...pet, matchScore: match };
        })
        .filter((pet: any) => pet.matchScore.score >= 0);

      const sortPetsByScoreAndPreference = (a: any, b: any) => {
        // Rule 0: Compatibility Score (Descending)
        const scoreDiff = b.matchScore.score - a.matchScore.score;
        if (scoreDiff !== 0) return scoreDiff;

        // Rule 1: Preferred Species Match
        const prefSpecies = (user.preferred_species || '').toLowerCase();
        if (prefSpecies && prefSpecies !== 'both') {
          const typeA = (a.type || '').toLowerCase();
          const typeB = (b.type || '').toLowerCase();
          const matchesA = typeA === prefSpecies ? 1 : 0;
          const matchesB = typeB === prefSpecies ? 1 : 0;
          if (matchesA !== matchesB) {
            return matchesB - matchesA;
          }
        }

        // Rule 2: Shelter Seniority (Oldest first - created_at ascending)
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        if (dateA !== dateB) {
          return dateA - dateB;
        }

        // Rule 3: Vulnerability (Senior or Special Needs first)
        const isVulnerable = (p: any) => {
          const isSenior = p.age_group === 'senior';
          const hasSpecialNeeds = p.special_needs && p.special_needs !== 'No' && p.special_needs !== 'none';
          return isSenior || hasSpecialNeeds ? 1 : 0;
        };
        const vulnA = isVulnerable(a);
        const vulnB = isVulnerable(b);
        if (vulnA !== vulnB) {
          return vulnB - vulnA;
        }

        // Rule 4: Proximity (City or Zip Match first)
        const userCity = (user.city || '').toLowerCase();
        const userZip = (user.zip_code || '').trim();
        const cityA = (a.owner_city || '').toLowerCase();
        const cityB = (b.owner_city || '').toLowerCase();
        const zipA = (a.owner_zip || '').trim();
        const zipB = (b.owner_zip || '').trim();

        const proxA = (userCity && userCity === cityA) || (userZip && userZip === zipA) ? 1 : 0;
        const proxB = (userCity && userCity === cityB) || (userZip && userZip === zipB) ? 1 : 0;
        if (proxA !== proxB) {
          return proxB - proxA;
        }

        // Rule 5: Stable Fallback
        return (a.id || '').localeCompare(b.id || '');
      };

      petsWithScores.sort(sortPetsByScoreAndPreference);

      // 4. Paginate
      const totalCount = petsWithScores.length;
      const paginatedSubset = petsWithScores.slice(offset, offset + limit);

      if (paginatedSubset.length === 0) {
        return NextResponse.json({ pets: [], totalCount });
      }

      // 5. Fetch full details for the paginated subset
      const petIds = paginatedSubset.map((p) => p.id);
      const fullPets = await sql`
        SELECT p.*, u.name AS owner_name, u.city AS owner_city, u.zip_code AS owner_zip
        FROM pets p
        JOIN users u ON p.owner_id = u.id
        WHERE p.id = ANY(${petIds})
      `;

      // Re-attach scores and sort again (since ANY order is not guaranteed)
      const paginatedPets = paginatedSubset.map((subsetPet) => {
        const fullPet = fullPets.find((fp) => fp.id === subsetPet.id);
        return { ...fullPet, matchScore: subsetPet.matchScore };
      });

      // Sort again by matchScore.score to maintain the original order
      paginatedPets.sort(sortPetsByScoreAndPreference);

      return NextResponse.json({ pets: paginatedPets, totalCount });
    } else {
      // Without ownerId, we filter all the adopted pets
      pets = await sql`
        SELECT 
          p.*, 
          u.name AS owner_name
        FROM pets p
        JOIN users u ON p.owner_id = u.id
        WHERE p.status != 'adopted'
        ORDER BY p.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      totalCountResult = await sql`
        SELECT COUNT(*) AS count
        FROM pets
        WHERE status != 'adopted'
      `;
    }

    const totalCount = Number(totalCountResult[0]?.count || 0);

    return NextResponse.json({ pets, totalCount });
  } catch (error) {
    console.error('[v0] Fetch pets error:', error);
    return NextResponse.json({ error: 'Failed to fetch pets' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureSpecialNeedsColumnSupportsText();
    await ensureChildrenMinAgeColumnExists();
    const petData = await request.json();
    const petId = `pet-${Date.now()}`;
    const childrenMinAge = petData.children_min_age !== undefined ? petData.children_min_age : (petData.childrenMinAge !== undefined ? petData.childrenMinAge : 0);

    await sql`
      INSERT INTO pets (
        id,
        name,
        type,
        breed,
        age_group,
        weight_range,
        energy_level,
        size,
        temperament,
        good_with_children,
        good_with_pets,
        house_trained,
        special_needs,
        description,
        image_url,
        owner_id,
        status,
        state,
        adoptable_out_of_state,
        only_pet,
        ok_with_animals,
        requires_fenced_yard,
        needs_company,
        comfortable_hours_alone,
        owner_experience_required,
        children_min_age
      )
      VALUES (
        ${petId},
        ${petData.name},
        ${petData.type},
        ${petData.breed},
        ${petData.ageGroup},
        ${petData.weightRange},
        ${petData.energyLevel},
        ${petData.size},
        ${petData.temperament || []},
        ${petData.goodWithChildren || false},
        ${petData.goodWithPets || false},
        ${petData.houseTrained || false},
        ${petData.specialNeeds || null},
        ${petData.description || null},
        ${petData.imageUrl || null},
        ${petData.ownerId},
        'available',
        ${petData.state || null},
        ${petData.adoptable_out_of_state || false},
        ${petData.only_pet || false},
        ${petData.ok_with_animals || null},
        ${petData.requires_fenced_yard === undefined ? false : petData.requires_fenced_yard},
        ${petData.needs_company || false},
        ${petData.comfortable_hours_alone || null},
        ${petData.owner_experience_required || null},
        ${childrenMinAge}
      )
    `;

    return NextResponse.json({ success: true, petId });
  } catch (error) {
    console.error('[API] Add pet error:', error);
    return NextResponse.json({ error: 'Failed to add pet' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await ensureSpecialNeedsColumnSupportsText();
    await ensureChildrenMinAgeColumnExists();
    const { petId, updates } = await request.json();
    const childrenMinAge = updates.children_min_age !== undefined ? updates.children_min_age : (updates.childrenMinAge !== undefined ? updates.childrenMinAge : 0);

    await sql`
      UPDATE pets 
      SET 
        name = ${updates.name},
        type = ${updates.type},
        breed = ${updates.breed},
        age_group = ${updates.ageGroup},
        weight_range = ${updates.weightRange},
        energy_level = ${updates.energyLevel},
        size = ${updates.size},
        temperament = ${updates.temperament},
        good_with_children = ${updates.good_with_children !== undefined ? updates.good_with_children : (updates.goodWithChildren || false)},
        good_with_pets = ${updates.good_with_pets !== undefined ? updates.good_with_pets : (updates.goodWithPets || false)},
        house_trained = ${updates.house_trained !== undefined ? updates.house_trained : (updates.houseTrained || false)},
        state = ${updates.state},
        adoptable_out_of_state = ${updates.adoptable_out_of_state},
        only_pet = ${updates.only_pet},
        ok_with_animals = ${updates.ok_with_animals},
        requires_fenced_yard = ${updates.requires_fenced_yard},
        needs_company = ${updates.needs_company},
        comfortable_hours_alone = ${updates.comfortable_hours_alone},
        owner_experience_required = ${updates.owner_experience_required},
        special_needs = ${updates.specialNeeds},
        description = ${updates.description},
        image_url = ${updates.imageUrl},
        children_min_age = ${childrenMinAge},
        updated_at = NOW()
      WHERE id = ${petId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Update pet error:', error);
    return NextResponse.json({ error: 'Failed to update pet' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const petId = searchParams.get('petId');

    if (!petId) {
      return NextResponse.json({ error: 'Pet ID required' }, { status: 400 });
    }

    await sql`DELETE FROM pets WHERE id = ${petId}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[v0] Delete pet error:', error);
    return NextResponse.json({ error: 'Failed to delete pet' }, { status: 500 });
  }
}

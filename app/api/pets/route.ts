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

export async function GET(request: NextRequest) {
  try {
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
          id, good_with_children, good_with_pets, house_trained, 
          energy_level, requires_fenced_yard, special_needs, state, 
          adoptable_out_of_state, age_group, breed, weight_range, 
          comfortable_hours_alone, owner_experience_required
        FROM pets 
        WHERE owner_id != ${excludeOwnerId} AND status != 'adopted'
      `;

      // 3. Calculate scores, filter > 0, and sort
      const { calculateCompatibility } = await import('@/lib/matching-algorithm');

      const petsWithScores = allPetsForScoring
        .map((pet: any) => {
          const match = calculateCompatibility(user, pet as Pet);
          return { ...pet, matchScore: match };
        })
        .filter((pet: any) => pet.matchScore.score > 0);

      petsWithScores.sort((a: any, b: any) => b.matchScore.score - a.matchScore.score);

      // 4. Paginate
      const totalCount = petsWithScores.length;
      const paginatedSubset = petsWithScores.slice(offset, offset + limit);

      if (paginatedSubset.length === 0) {
        return NextResponse.json({ pets: [], totalCount });
      }

      // 5. Fetch full details for the paginated subset
      const petIds = paginatedSubset.map((p) => p.id);
      const fullPets = await sql`
        SELECT p.*, u.name AS owner_name
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
      paginatedPets.sort((a: any, b: any) => b.matchScore.score - a.matchScore.score);

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
    const petData = await request.json();
    const petId = `pet-${Date.now()}`;

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
        owner_experience_required
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
        ${petData.owner_experience_required || null}
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
    const { petId, updates } = await request.json();

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
        good_with_children = ${updates.goodWithChildren},
        good_with_pets = ${updates.goodWithPets},
        house_trained = ${updates.houseTrained},
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

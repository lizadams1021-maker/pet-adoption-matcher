import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get("ownerId");
    const excludeOwnerId = searchParams.get("excludeOwnerId");

    const limit = Number(searchParams.get("limit")) || 10;
    const offset = Number(searchParams.get("page")) || 0;

    let pets;
    let totalCountResult;

    if (ownerId) {
      // If has ownerId, we bring pets with no filter by status
      pets = await sql`
        SELECT 
          p.id, 
          p.name, 
          p.breed, 
          p.age_group, 
          p.type,
          p.energy_level, 
          p.size, 
          p.good_with_children,
          p.good_with_pets,
          p.status,
          p.image_url,
          u.name AS owner_name
        FROM pets p
        JOIN users u ON p.owner_id = u.id
        WHERE p.owner_id = ${ownerId}
        ORDER BY p.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      totalCountResult = await sql`
        SELECT COUNT(*) AS count
        FROM pets
        WHERE owner_id = ${ownerId}
      `;
    } else if (excludeOwnerId) {
      // We exclude ownerId and not displaye adopted pets
      pets = await sql`
        SELECT 
          p.id, 
          p.name, 
          p.breed, 
          p.age_group,
          p.temperament, 
          p.energy_level, 
          p.size, 
          u.name AS owner_name
        FROM pets p
        JOIN users u ON p.owner_id = u.id
        WHERE p.owner_id != ${excludeOwnerId} AND p.status != 'adopted'
        ORDER BY p.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      totalCountResult = await sql`
        SELECT COUNT(*) AS count
        FROM pets
        WHERE owner_id != ${excludeOwnerId} AND status != 'adopted'
      `;
    } else {
      // Without ownerId, we filter all the adopted pets
      pets = await sql`
        SELECT 
          p.id, 
          p.name, 
          p.breed, 
          p.age_group,
          p.temperament, 
          p.energy_level, 
          p.size, 
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
    console.error("[v0] Fetch pets error:", error);
    return NextResponse.json(
      { error: "Failed to fetch pets" },
      { status: 500 }
    );
  }
}



export async function POST(request: NextRequest) {
  try {
    const petData = await request.json()
    const petId = `pet-${Date.now()}`

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
        ${petData.requires_fenced_yard || false},
        ${petData.needs_company || false},
        ${petData.comfortable_hours_alone || null},
        ${petData.owner_experience_required || null}
      )
    `

    return NextResponse.json({ success: true, petId })
  } catch (error) {
    console.error("[API] Add pet error:", error)
    return NextResponse.json({ error: "Failed to add pet" }, { status: 500 })
  }
}


export async function PUT(request: NextRequest) {
  try {
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
    console.error("[API] Update pet error:", error);
    return NextResponse.json(
      { error: "Failed to update pet" },
      { status: 500 }
    );
  }
}


export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const petId = searchParams.get("petId")

    if (!petId) {
      return NextResponse.json({ error: "Pet ID required" }, { status: 400 })
    }

    await sql`DELETE FROM pets WHERE id = ${petId}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Delete pet error:", error)
    return NextResponse.json({ error: "Failed to delete pet" }, { status: 500 })
  }
}

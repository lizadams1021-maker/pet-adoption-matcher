import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ownerId = searchParams.get("ownerId")

    if (!ownerId) {
      return NextResponse.json({ error: "Owner ID required" }, { status: 400 })
    }

    const pets = await sql`
      SELECT * FROM pets 
      WHERE owner_id = ${ownerId}
      ORDER BY created_at DESC
    `

    return NextResponse.json({ pets })
  } catch (error) {
    console.error("[v0] Fetch pets error:", error)
    return NextResponse.json({ error: "Failed to fetch pets" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const petData = await request.json()
    const petId = `pet-${Date.now()}`

    await sql`
      INSERT INTO pets (
        id, name, type, breed, age_group, weight_range, energy_level, 
        size, temperament, good_with_children, good_with_pets, 
        house_trained, special_needs, description, image_url, owner_id, status
      )
      VALUES (
        ${petId}, ${petData.name}, ${petData.type}, ${petData.breed}, 
        ${petData.ageGroup}, ${petData.weightRange}, ${petData.energyLevel},
        ${petData.size}, ${petData.temperament}, ${petData.goodWithChildren},
        ${petData.goodWithPets}, ${petData.houseTrained}, ${petData.specialNeeds},
        ${petData.description}, ${petData.imageUrl}, ${petData.ownerId}, 'available'
      )
    `

    return NextResponse.json({ success: true, petId })
  } catch (error) {
    console.error("[v0] Add pet error:", error)
    return NextResponse.json({ error: "Failed to add pet" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { petId, updates } = await request.json()

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
        special_needs = ${updates.specialNeeds},
        description = ${updates.description},
        image_url = ${updates.imageUrl},
        updated_at = NOW()
      WHERE id = ${petId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Update pet error:", error)
    return NextResponse.json({ error: "Failed to update pet" }, { status: 500 })
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

import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { validateProfileForm, type ProfileFormData } from "@/lib/profile-validation"

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, ...profileData } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Validate data
    const validationErrors = validateProfileForm(profileData as Partial<ProfileFormData>)
    if (validationErrors.length > 0) {
      return NextResponse.json({ errors: validationErrors }, { status: 400 })
    }

    // Mapping form fields to db columns
    const columnMap: Record<string, string> = {
      firstName: "first_name",
      lastName: "last_name",
      email: "email",
      homePhone: "home_phone",
      cellPhone: "cell_phone",
      gender: "gender",
      birthday: "birthday",
      addressLine: "address_line",
      city: "city",
      state: "state",
      zipCode: "zip_code",
      willingOutOfState: "willing_out_of_state",
      hasPets: "has_pets",
      petsTypes: "pets_types",
      petsGoodWithOthers: "pets_good_with_others",
      hasFencedYard: "has_fenced_yard",
      homeType: "home_type",
      landlordAllowsPets: "landlord_allows_pets",
      landlordPhone: "landlord_phone",
      landlordEmail: "landlord_email",
      associationRestrictions: "association_restrictions",
      worksOutsideHome: "works_outside_home",
      hoursHomeAlone: "hours_home_alone",
      wherePetsWhenAway: "where_pets_when_away",
      childrenCount: "children_count",
      childrenAges: "children_ages",
      adultsInHome: "adults_in_home",
      homeActivityLevel: "home_activity_level",
      petLiveLocation: "pet_live_location",
      adoptionTimeline: "adoption_timeline",
      preferredDogBreed: "preferred_dog_breed",
      preferredCatType: "preferred_cat_type",
      preferredAge: "preferred_age",
      preferredWeight: "preferred_weight",
      preferredTemperamentDetailed: "preferred_temperament_detailed",
      preferredEnergy: "preferred_energy",
      undesiredCharacteristics: "undesired_characteristics",
      takePetsToVet: "take_pets_to_vet",
      vetName: "vet_name",
      vetPhone: "vet_phone",
      vetEmail: "vet_email",
      reference1Name: "reference1_name",
      reference1Phone: "reference1_phone",
      reference1Email: "reference1_email",
      reference2Name: "reference2_name",
      reference2Phone: "reference2_phone",
      reference2Email: "reference2_email",
      adoptedBefore: "adopted_before",
      ownedPetBefore: "owned_pet_before",
      spayedNeutered: "spayed_neutered",
      vaccinated: "vaccinated",
      hadPetsNoLongerHave: "had_pets_no_longer_have",
      willingBehaviorTraining: "willing_behavior_training",
      reasonsGiveUp: "reasons_give_up",
      planForVetCosts: "plan_for_vet_costs",
      additionalComments: "additional_comments",
      imageUrl: "image_url",
    }

    // Filter only fields with value and valid mapping
    const entries = Object.entries(profileData)
      .filter(([key, value]) => value !== undefined && value !== null && columnMap[key])
      .map(([key, value]) => ({ column: columnMap[key], value }))

    if (entries.length === 0) {
      return NextResponse.json({ success: true, message: "No changes to update" }, { status: 200 })
    }

    // Build a dynamic SET using only safe values interpolation
    const setClauses = entries.map((_, i) => `"${entries[i].column}" = $${i + 1}`).join(", ")
    const values = entries.map(e => e.value)

    // Add updated_at
    const updatedAtIndex = values.length + 1
    const query = `UPDATE users SET ${setClauses}, updated_at = NOW() WHERE id = $${updatedAtIndex}`
    values.push(userId)

    // Execute safe query
    await sql.query(query, values)

    // Bring updated user
    const result = await sql`SELECT * FROM users WHERE id = ${userId}`

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, user: result[0] }, { status: 200 })

  } catch (error) {
    console.error("[PUT] Update profile error:", error)
    return NextResponse.json({ error: "Failed to update profile", details: String(error) }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }
    const result = await sql`SELECT * FROM users WHERE id = ${userId}`

    if (result.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user: result[0] }, { status: 200 })
  } catch (error) {
    console.error("[v0] Get profile error:", error)
    return NextResponse.json({ error: "Failed to get profile" }, { status: 500 })
  }
}

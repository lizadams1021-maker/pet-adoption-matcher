import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { validateProfileForm, type ProfileFormData } from "@/lib/profile-validation"

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("[v0] Profile update request received:", { userId: body.userId, fieldCount: Object.keys(body).length })

    const { userId, ...profileData } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Validate the profile data
    const validationErrors = validateProfileForm(profileData as Partial<ProfileFormData>)
    if (validationErrors.length > 0) {
      console.log("[v0] Validation errors:", validationErrors)
      return NextResponse.json({ errors: validationErrors }, { status: 400 })
    }

    // Build dynamic UPDATE query based on provided fields
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    // Helper to add field to update
    const addField = (dbColumn: string, value: any) => {
      if (value !== undefined && value !== null) {
        updates.push(`${dbColumn} = $${paramIndex}`)
        values.push(value)
        paramIndex++
      }
    }

    addField("first_name", profileData.firstName)
    addField("last_name", profileData.lastName)
    addField("email", profileData.email)
    addField("home_phone", profileData.homePhone)
    addField("cell_phone", profileData.cellPhone)
    addField("gender", profileData.gender)
    addField("birthday", profileData.birthday)
    addField("address_line", profileData.addressLine)
    addField("city", profileData.city)
    addField("state", profileData.state)
    addField("zip_code", profileData.zipCode)

    if (profileData.willingOutOfState !== undefined) {
      updates.push(`willing_out_of_state = $${paramIndex}`)
      values.push(profileData.willingOutOfState)
      paramIndex++
    }

    if (profileData.hasPets !== undefined) {
      updates.push(`has_pets = $${paramIndex}`)
      values.push(profileData.hasPets)
      paramIndex++
    }

    // Array fields
    if (profileData.petsTypes !== undefined) {
      updates.push(`pets_types = $${paramIndex}`)
      values.push(profileData.petsTypes)
      paramIndex++
    }

    if (profileData.petsGoodWithOthers !== undefined) {
      updates.push(`pets_good_with_others = $${paramIndex}`)
      values.push(profileData.petsGoodWithOthers)
      paramIndex++
    }

    if (profileData.hasFencedYard !== undefined) {
      updates.push(`has_fenced_yard = $${paramIndex}`)
      values.push(profileData.hasFencedYard)
      paramIndex++
    }

    addField("home_type", profileData.homeType)

    if (profileData.landlordAllowsPets !== undefined) {
      updates.push(`landlord_allows_pets = $${paramIndex}`)
      values.push(profileData.landlordAllowsPets)
      paramIndex++
    }

    addField("landlord_phone", profileData.landlordPhone)
    addField("landlord_email", profileData.landlordEmail)

    if (profileData.associationRestrictions !== undefined) {
      updates.push(`association_restrictions = $${paramIndex}`)
      values.push(profileData.associationRestrictions)
      paramIndex++
    }

    if (profileData.worksOutsideHome !== undefined) {
      updates.push(`works_outside_home = $${paramIndex}`)
      values.push(profileData.worksOutsideHome)
      paramIndex++
    }

    addField("hours_home_alone", profileData.hoursHomeAlone)
    addField("where_pets_when_away", profileData.wherePetsWhenAway)

    if (profileData.hasChildren !== undefined) {
      updates.push(`has_children = $${paramIndex}`)
      values.push(profileData.hasChildren)
      paramIndex++
    }

    if (profileData.childrenCount !== undefined) {
      updates.push(`children_count = $${paramIndex}`)
      values.push(profileData.childrenCount)
      paramIndex++
    }

    addField("children_ages", profileData.childrenAges)

    if (profileData.adultsInHome !== undefined) {
      updates.push(`adults_in_home = $${paramIndex}`)
      values.push(profileData.adultsInHome)
      paramIndex++
    }

    addField("home_activity_level", profileData.homeActivityLevel)
    addField("pet_live_location", profileData.petLiveLocation)
    addField("adoption_timeline", profileData.adoptionTimeline)
    addField("preferred_dog_breed", profileData.preferredDogBreed)
    addField("preferred_cat_type", profileData.preferredCatType)
    addField("preferred_age", profileData.preferredAge)
    addField("preferred_weight", profileData.preferredWeight)

    if (profileData.preferredTemperamentDetailed !== undefined) {
      updates.push(`preferred_temperament_detailed = $${paramIndex}`)
      values.push(profileData.preferredTemperamentDetailed)
      paramIndex++
    }

    addField("preferred_energy", profileData.preferredEnergy)

    if (profileData.undesiredCharacteristics !== undefined) {
      updates.push(`undesired_characteristics = $${paramIndex}`)
      values.push(profileData.undesiredCharacteristics)
      paramIndex++
    }

    if (profileData.takePetsToVet !== undefined) {
      updates.push(`take_pets_to_vet = $${paramIndex}`)
      values.push(profileData.takePetsToVet)
      paramIndex++
    }

    addField("vet_name", profileData.vetName)
    addField("vet_phone", profileData.vetPhone)
    addField("vet_email", profileData.vetEmail)
    addField("reference1_name", profileData.reference1Name)
    addField("reference1_phone", profileData.reference1Phone)
    addField("reference1_email", profileData.reference1Email)
    addField("reference2_name", profileData.reference2Name)
    addField("reference2_phone", profileData.reference2Phone)
    addField("reference2_email", profileData.reference2Email)

    if (profileData.adoptedBefore !== undefined) {
      updates.push(`adopted_before = $${paramIndex}`)
      values.push(profileData.adoptedBefore)
      paramIndex++
    }

    if (profileData.ownedPetBefore !== undefined) {
      updates.push(`owned_pet_before = $${paramIndex}`)
      values.push(profileData.ownedPetBefore)
      paramIndex++
    }

    if (profileData.spayedNeutered !== undefined) {
      updates.push(`spayed_neutered = $${paramIndex}`)
      values.push(profileData.spayedNeutered)
      paramIndex++
    }

    if (profileData.vaccinated !== undefined) {
      updates.push(`vaccinated = $${paramIndex}`)
      values.push(profileData.vaccinated)
      paramIndex++
    }

    addField("had_pets_no_longer_have", profileData.hadPetsNoLongerHave)

    if (profileData.willingBehaviorTraining !== undefined) {
      updates.push(`willing_behavior_training = $${paramIndex}`)
      values.push(profileData.willingBehaviorTraining)
      paramIndex++
    }

    addField("reasons_give_up", profileData.reasonsGiveUp)
    addField("plan_for_vet_costs", profileData.planForVetCosts)
    addField("additional_comments", profileData.additionalComments)
    addField("image_url", profileData.imageUrl)

    // Always update the updated_at timestamp
    updates.push(`updated_at = NOW()`)

    if (updates.length === 1) {
      // Only updated_at, no actual changes
      console.log("[v0] No changes to update")
      return NextResponse.json({ success: true, message: "No changes to update" }, { status: 200 })
    }

    // Add userId as the last parameter
    values.push(userId)

    // Execute the update
    const query = `UPDATE users SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING *`
    console.log("[v0] Executing update with", updates.length - 1, "fields")
    console.log("[v0] Sample values:", {
      firstName: values[0],
      lastName: values[1],
      email: values[2],
      userId: values[values.length - 1],
    })

    const result = await sql.unsafe(query, values)

    if (result.length === 0) {
      console.log("[v0] User not found:", userId)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log("[v0] Profile updated successfully for user:", userId)
    console.log("[v0] Updated data sample:", {
      firstName: result[0].first_name,
      lastName: result[0].last_name,
      email: result[0].email,
      city: result[0].city,
      state: result[0].state,
    })

    return NextResponse.json({ success: true, user: result[0] }, { status: 200 })
  } catch (error) {
    console.error("[v0] Update profile error:", error)
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

    console.log("[v0] Fetching profile for user:", userId)
    const result = await sql`SELECT * FROM users WHERE id = ${userId}`

    if (result.length === 0) {
      console.log("[v0] User not found:", userId)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log("[v0] Profile fetched successfully")
    console.log("[v0] Fetched data sample:", {
      firstName: result[0].first_name,
      lastName: result[0].last_name,
      email: result[0].email,
      city: result[0].city,
      state: result[0].state,
      hasAllFields: !!(result[0].first_name && result[0].last_name && result[0].email),
    })

    return NextResponse.json({ user: result[0] }, { status: 200 })
  } catch (error) {
    console.error("[v0] Get profile error:", error)
    return NextResponse.json({ error: "Failed to get profile" }, { status: 500 })
  }
}

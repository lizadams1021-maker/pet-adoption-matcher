import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    // Check if user already exists
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (existingUsers.length > 0) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // In production, use proper password hashing (bcrypt)
    const userId = `user-${Date.now()}`

    await sql`
      INSERT INTO users (id, email, password_hash, name, has_children)
      VALUES (${userId}, ${email}, ${password}, ${name}, false)
    `

    const user = {
      id: userId,
      email,
      name,
      preferences: {
        location: null,
        housingType: null,
        hasChildren: false,
        experienceLevel: null,
        activityLevel: null,
        petSizePreference: null,
        temperamentPreference: [],
      },
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("[v0] Registration error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}

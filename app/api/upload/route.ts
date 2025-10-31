import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Upload route called")
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      console.log("[v0] No file provided")
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("[v0] File received:", file.name, file.type, file.size)

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/jpg"]
    if (!validTypes.includes(file.type)) {
      console.log("[v0] Invalid file type:", file.type)
      return NextResponse.json({ error: "Invalid file type. Only JPEG and PNG are allowed." }, { status: 400 })
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      console.log("[v0] File too large:", file.size)
      return NextResponse.json({ error: "File size exceeds 5MB limit" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")
    const dataUrl = `data:${file.type};base64,${base64}`

    console.log("[v0] Image converted to base64, length:", dataUrl.length)

    // Return the data URL to be stored in the database
    return NextResponse.json({ imageUrl: dataUrl }, { status: 200 })
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return NextResponse.json({ error: "Failed to upload file", details: String(error) }, { status: 500 })
  }
}

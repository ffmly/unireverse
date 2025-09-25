import { NextResponse } from "next/server"
import { stadiumsOperations } from "@/lib/firestore-utils"

export async function GET() {
  try {
    const data = await stadiumsOperations.getAll()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching stadiums:", error)
    return NextResponse.json({ error: "Failed to fetch stadiums" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, sportId } = await request.json()

    const data = await stadiumsOperations.create({
      name,
      sport_id: sportId,
      enabled: true
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating stadium:", error)
    return NextResponse.json({ error: "Failed to create stadium" }, { status: 500 })
  }
}

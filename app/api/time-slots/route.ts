import { NextResponse } from "next/server"
import { timeSlotsOperations } from "@/lib/firestore-utils"

export async function GET() {
  try {
    const data = await timeSlotsOperations.getAll()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching time slots:", error)
    return NextResponse.json({ error: "Failed to fetch time slots" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { time, period } = await request.json()

    // Check if time slot already exists
    const existingSlots = await timeSlotsOperations.findByTimeAndPeriod(time, period)

    if (existingSlots.length > 0) {
      return NextResponse.json({ error: "Time slot already exists" }, { status: 400 })
    }

    // Insert new time slot
    const data = await timeSlotsOperations.create({
      time,
      period,
      enabled: true
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating time slot:", error)
    return NextResponse.json({ error: "Failed to create time slot" }, { status: 500 })
  }
}

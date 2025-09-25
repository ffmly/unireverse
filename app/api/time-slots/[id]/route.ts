import { NextResponse } from "next/server"
import { timeSlotsOperations } from "@/lib/firestore-utils"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { enabled } = await request.json()
    const { id } = await params

    const data = await timeSlotsOperations.update(id, { enabled })

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating time slot:", error)
    return NextResponse.json({ error: "Failed to update time slot" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    await timeSlotsOperations.delete(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting time slot:", error)
    return NextResponse.json({ error: "Failed to delete time slot" }, { status: 500 })
  }
}

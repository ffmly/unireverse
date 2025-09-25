import { NextResponse } from "next/server"
import { stadiumsOperations } from "@/lib/firestore-utils"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const updateData = await request.json()

    const data = await stadiumsOperations.update(id, updateData)

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating stadium:", error)
    return NextResponse.json({ error: "Failed to update stadium" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    await stadiumsOperations.delete(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting stadium:", error)
    return NextResponse.json({ error: "Failed to delete stadium" }, { status: 500 })
  }
} 
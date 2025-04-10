import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { trainAIModel } from "@/lib/gmail-actions"

export async function POST() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "You must be signed in to access this endpoint" }, { status: 401 })
  }

  try {
    await trainAIModel()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error training AI model:", error)
    return NextResponse.json({ error: "Failed to train AI model" }, { status: 500 })
  }
}

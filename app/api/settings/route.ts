import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { saveFilterSettings } from "@/lib/gmail-actions"

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "You must be signed in to access this endpoint" }, { status: 401 })
  }

  try {
    const settings = await request.json()
    await saveFilterSettings(settings)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving settings:", error)
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 })
  }
}

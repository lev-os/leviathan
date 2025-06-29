import { NextResponse } from "next/server"
import { db } from "@/db"
import { channels } from "@/db/schema"

export async function GET() {
  try {
    const allChannels = await db.select().from(channels)
    return NextResponse.json(allChannels)
  } catch (error) {
    console.error("Error fetching channels:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


import { NextResponse } from "next/server"
import { db } from "@/db"
import { channels } from "@/db/schema"

export async function GET() {
  const allChannels = await db.select().from(channels)
  return NextResponse.json(allChannels)
}


import { NextResponse } from "next/server"
import { db } from "@/db"
import { watchlistItems } from "@/db/schema"
import { eq } from "drizzle-orm"

// Mock user authentication (replace with actual auth in a real app)
const MOCK_USER_ID = 1

export async function GET() {
  const userWatchlistItems = await db.select().from(watchlistItems).where(eq(watchlistItems.userId, MOCK_USER_ID))
  return NextResponse.json(userWatchlistItems)
}

export async function POST(request: Request) {
  const body = await request.json()
  const newItem = await db
    .insert(watchlistItems)
    .values({ ...body, userId: MOCK_USER_ID })
    .returning()
  return NextResponse.json(newItem[0])
}


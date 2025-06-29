import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { watchlistItems } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// Mock user authentication (replace with actual auth in a real app)
const MOCK_USER_ID = 1;

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const updatedItem = await db
    .update(watchlistItems)
    .set(body)
    .where(
      and(
        eq(watchlistItems.id, Number.parseInt(body.id)),
        eq(watchlistItems.userId, MOCK_USER_ID)
      )
    )
    .returning();

  if (updatedItem.length === 0) {
    return NextResponse.json(
      { error: "Item not found or not owned by user" },
      { status: 404 }
    );
  }

  return NextResponse.json(updatedItem[0]);
}

export async function DELETE(request: NextRequest) {
  const body = await request.json();
  const result = await db
    .delete(watchlistItems)
    .where(
      and(
        eq(watchlistItems.id, Number.parseInt(body.id)),
        eq(watchlistItems.userId, MOCK_USER_ID)
      )
    )
    .returning();

  if (result.length === 0) {
    return NextResponse.json(
      { error: "Item not found or not owned by user" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}

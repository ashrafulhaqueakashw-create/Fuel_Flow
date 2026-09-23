import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";

const db = getPool();

export async function POST(request: NextRequest) {
  try {
    // Drop existing tables
    await db.execute("DROP TABLE IF EXISTS bookings");
    await db.execute("DROP TABLE IF EXISTS time_slots");
    await db.execute("DROP TABLE IF EXISTS fuel_prices");

    return NextResponse.json({
      success: true,
      message: "Booking system tables dropped successfully",
    });
  } catch (error) {
    console.error("Database reset error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reset booking system tables" },
      { status: 500 }
    );
  }
}

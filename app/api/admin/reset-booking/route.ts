import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "fuelflow",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

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

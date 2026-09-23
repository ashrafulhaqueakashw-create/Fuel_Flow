import { NextRequest, NextResponse } from "next/server";
import { createConnection } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const connection = await createConnection();

    // Check what tables exist
    const [tables] = await connection.execute("SHOW TABLES");

    // Check if time_slots table structure exists
    let timeSlotStructure = null;
    try {
      const [structure] = await connection.execute("DESCRIBE time_slots");
      timeSlotStructure = structure;
    } catch (error) {
      timeSlotStructure = "Table does not exist";
    }

    await connection.end();

    return NextResponse.json({
      success: true,
      tables: tables,
      timeSlotStructure: timeSlotStructure,
    });
  } catch (error) {
    console.error("Database check error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

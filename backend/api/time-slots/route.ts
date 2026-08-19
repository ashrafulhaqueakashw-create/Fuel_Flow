import { NextRequest, NextResponse } from "next/server";
import { createConnection } from "../../lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const fuelType = searchParams.get("fuel_type");

    const connection = await createConnection();

    // Get available time slots for the specified date (default to today)
    const targetDate = date || new Date().toISOString().split("T")[0];

    const [slots] = await connection.execute(
      `
      SELECT 
        ts.*,
        (ts.max_capacity - ts.current_bookings) as available_capacity,
        CASE 
          WHEN ts.current_bookings >= ts.max_capacity THEN false
          ELSE ts.is_available
        END as is_bookable
      FROM time_slots ts
      WHERE ts.date = ? AND ts.date >= CURDATE()
      ORDER BY ts.start_time
    `,
      [targetDate]
    );

    // Get current fuel prices
    const [prices] = await connection.execute(`
      SELECT fuel_type, price_per_liter
      FROM fuel_prices
      WHERE is_current = TRUE
    `);

    await connection.end();

    return NextResponse.json({
      success: true,
      data: {
        date: targetDate,
        time_slots: slots,
        fuel_prices: prices,
      },
    });
  } catch (error) {
    console.error("Error fetching time slots:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch time slots" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      date,
      start_time,
      end_time,
      max_capacity,
      congestion_level,
      discount_percentage,
    } = body;

    if (!date || !start_time || !end_time) {
      return NextResponse.json(
        {
          success: false,
          message: "Date, start time, and end time are required",
        },
        { status: 400 }
      );
    }

    const connection = await createConnection();

    const [result] = await connection.execute(
      `
      INSERT INTO time_slots (date, start_time, end_time, max_capacity, congestion_level, discount_percentage)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      [
        date,
        start_time,
        end_time,
        max_capacity || 10,
        congestion_level || "medium",
        discount_percentage || 0,
      ]
    );

    await connection.end();

    return NextResponse.json({
      success: true,
      message: "Time slot created successfully",
      data: { id: (result as any).insertId },
    });
  } catch (error) {
    console.error("Error creating time slot:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create time slot" },
      { status: 500 }
    );
  }
}

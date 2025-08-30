import { NextRequest, NextResponse } from "next/server";
import { createConnection } from "../../../../lib/db";

export async function POST(request: NextRequest) {
  try {
    const connection = await createConnection();

    // Insert a test booking
    const [result] = await connection.execute(
      `
      INSERT INTO bookings (
        customer_id, customer_email, customer_name, time_slot_id, fuel_type, quantity_liters,
        price_per_liter, total_amount, discount_applied, final_amount,
        delivery_address, payment_method, special_instructions
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        null, // customer_id
        "test@example.com", // customer_email
        "Test Customer", // customer_name
        1, // time_slot_id (assuming slot 1 exists)
        "gasoline", // fuel_type
        50.0, // quantity_liters
        1.45, // price_per_liter
        72.5, // total_amount
        0.0, // discount_applied
        72.5, // final_amount
        "123 Test Street, Test City", // delivery_address
        "card", // payment_method
        "Test booking for debugging", // special_instructions
      ]
    );

    await connection.end();

    return NextResponse.json({
      success: true,
      message: "Test booking created",
      bookingId: (result as any).insertId,
    });
  } catch (error) {
    console.error("Test booking creation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

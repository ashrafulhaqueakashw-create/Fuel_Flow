import { NextRequest, NextResponse } from "next/server";
import { createConnection } from "@/lib/db";

export async function POST(request: NextRequest) {
  let connection;

  try {
    connection = await createConnection();

    console.log("Connected to database successfully");

    // Add missing columns one by one with error handling
    const columnsToAdd = [
      {
        name: "customer_email",
        sql: 'ALTER TABLE bookings ADD COLUMN customer_email VARCHAR(255) NOT NULL DEFAULT "guest@fuelflow.com"',
      },
      {
        name: "customer_name",
        sql: 'ALTER TABLE bookings ADD COLUMN customer_name VARCHAR(255) NOT NULL DEFAULT "Guest Customer"',
      },
      {
        name: "fuel_quantity",
        sql: "ALTER TABLE bookings ADD COLUMN fuel_quantity DECIMAL(10, 2) NOT NULL DEFAULT 0.00",
      },
      {
        name: "price_per_liter",
        sql: "ALTER TABLE bookings ADD COLUMN price_per_liter DECIMAL(10, 2) NOT NULL DEFAULT 0.00",
      },
      {
        name: "total_amount",
        sql: "ALTER TABLE bookings ADD COLUMN total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00",
      },
      {
        name: "discount_amount",
        sql: "ALTER TABLE bookings ADD COLUMN discount_amount DECIMAL(10, 2) DEFAULT 0.00",
      },
      {
        name: "delivery_address",
        sql: "ALTER TABLE bookings ADD COLUMN delivery_address TEXT",
      },
      {
        name: "payment_method",
        sql: 'ALTER TABLE bookings ADD COLUMN payment_method ENUM("credit_card", "debit_card", "cash", "online") DEFAULT "online"',
      },
      {
        name: "special_instructions",
        sql: "ALTER TABLE bookings ADD COLUMN special_instructions TEXT",
      },
      {
        name: "payment_status",
        sql: 'ALTER TABLE bookings ADD COLUMN payment_status ENUM("pending", "paid", "failed", "refunded") DEFAULT "pending"',
      },
      {
        name: "booking_status",
        sql: 'ALTER TABLE bookings ADD COLUMN booking_status ENUM("confirmed", "in_progress", "completed", "cancelled") DEFAULT "confirmed"',
      },
    ];

    const results = [];

    for (const column of columnsToAdd) {
      try {
        await connection.execute(column.sql);
        results.push(`✓ Added column: ${column.name}`);
        console.log(`Added column: ${column.name}`);
      } catch (error: any) {
        if (error.code === "ER_DUP_FIELDNAME") {
          results.push(`- Column ${column.name} already exists`);
        } else {
          results.push(`✗ Error adding ${column.name}: ${error.message}`);
        }
      }
    }

    // Verify the final table structure
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'fuelflow' AND TABLE_NAME = 'bookings'
      ORDER BY ORDINAL_POSITION
    `);

    await connection.end();

    return NextResponse.json({
      success: true,
      message: "Booking table columns updated successfully",
      results: results,
      tableStructure: columns,
    });
  } catch (error) {
    console.error("Database update error:", error);
    if (connection) {
      await connection.end();
    }
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        details: error,
      },
      { status: 500 }
    );
  }
}

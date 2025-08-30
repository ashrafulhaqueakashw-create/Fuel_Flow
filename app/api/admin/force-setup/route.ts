import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function POST(request: NextRequest) {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "fuelflow",
    });

    console.log("Connected to database successfully");

    // Drop existing tables if they exist (to ensure clean setup)
    await connection.execute("DROP TABLE IF EXISTS bookings");
    await connection.execute("DROP TABLE IF EXISTS time_slots");
    await connection.execute("DROP TABLE IF EXISTS fuel_prices");

    console.log("Dropped existing tables");

    // Create time_slots table
    const createTimeSlotsQuery = `
      CREATE TABLE time_slots (
        id INT AUTO_INCREMENT PRIMARY KEY,
        date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        max_capacity INT DEFAULT 10,
        current_bookings INT DEFAULT 0,
        congestion_level ENUM('low', 'medium', 'high') DEFAULT 'low',
        is_available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_slot (date, start_time, end_time)
      )
    `;

    await connection.execute(createTimeSlotsQuery);
    console.log("Created time_slots table");

    // Create fuel_prices table
    const createFuelPricesQuery = `
      CREATE TABLE fuel_prices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fuel_type ENUM('gasoline', 'diesel', 'premium') NOT NULL,
        price_per_liter DECIMAL(10, 2) NOT NULL,
        effective_date DATE NOT NULL,
        is_current BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;

    await connection.execute(createFuelPricesQuery);
    console.log("Created fuel_prices table");

    // Create bookings table
    const createBookingsQuery = `
      CREATE TABLE bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_email VARCHAR(255) NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        time_slot_id INT NOT NULL,
        fuel_type ENUM('gasoline', 'diesel', 'premium') NOT NULL,
        fuel_quantity DECIMAL(10, 2) NOT NULL,
        price_per_liter DECIMAL(10, 2) NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        discount_amount DECIMAL(10, 2) DEFAULT 0.00,
        payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
        booking_status ENUM('confirmed', 'in_progress', 'completed', 'cancelled') DEFAULT 'confirmed',
        delivery_address TEXT NOT NULL,
        contact_phone VARCHAR(20),
        special_instructions TEXT,
        payment_method ENUM('credit_card', 'debit_card', 'cash', 'online') DEFAULT 'online',
        transaction_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (time_slot_id) REFERENCES time_slots(id)
      )
    `;

    await connection.execute(createBookingsQuery);
    console.log("Created bookings table");

    // Insert sample time slots for the next 7 days
    const today = new Date();
    const insertPromises = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];

      // Create slots from 8 AM to 6 PM (every 2 hours)
      const slots = [
        { start: "08:00:00", end: "10:00:00" },
        { start: "10:00:00", end: "12:00:00" },
        { start: "12:00:00", end: "14:00:00" },
        { start: "14:00:00", end: "16:00:00" },
        { start: "16:00:00", end: "18:00:00" },
      ];

      for (const slot of slots) {
        const insertQuery = `
          INSERT INTO time_slots (date, start_time, end_time, max_capacity, current_bookings, is_available) 
          VALUES (?, ?, ?, 10, 0, TRUE)
        `;
        insertPromises.push(
          connection.execute(insertQuery, [dateStr, slot.start, slot.end])
        );
      }
    }

    await Promise.all(insertPromises);
    console.log("Inserted time slots");

    // Insert current fuel prices
    const fuelPricesQuery = `
      INSERT INTO fuel_prices (fuel_type, price_per_liter, effective_date, is_current) VALUES
      ('gasoline', 1.45, CURDATE(), TRUE),
      ('diesel', 1.52, CURDATE(), TRUE),
      ('premium', 1.68, CURDATE(), TRUE)
    `;

    await connection.execute(fuelPricesQuery);
    console.log("Inserted fuel prices");

    // Verify tables were created
    const [tables] = await connection.execute("SHOW TABLES");
    const [timeSlotsCount] = await connection.execute(
      "SELECT COUNT(*) as count FROM time_slots"
    );
    const [fuelPricesCount] = await connection.execute(
      "SELECT COUNT(*) as count FROM fuel_prices"
    );

    await connection.end();

    return NextResponse.json({
      success: true,
      message: "All booking system tables created and populated successfully",
      details: {
        tables: tables,
        timeSlotsCount: (timeSlotsCount as any)[0].count,
        fuelPricesCount: (fuelPricesCount as any)[0].count,
      },
    });
  } catch (error) {
    console.error("Database setup error:", error);
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

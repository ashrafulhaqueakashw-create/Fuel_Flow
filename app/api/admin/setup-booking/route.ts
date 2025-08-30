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
    // Create time_slots table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS time_slots (
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
    `);

    // Create fuel_prices table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS fuel_prices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fuel_type ENUM('gasoline', 'diesel', 'premium') NOT NULL,
        price_per_liter DECIMAL(10, 2) NOT NULL,
        effective_date DATE NOT NULL,
        is_current BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create bookings table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS bookings (
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
    `);

    // Insert sample time slots for the next 7 days
    const today = new Date();
    const timeSlots = [];

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
        timeSlots.push([dateStr, slot.start, slot.end]);
      }
    }

    // Insert time slots
    if (timeSlots.length > 0) {
      await db.execute(
        `INSERT IGNORE INTO time_slots (date, start_time, end_time) VALUES ${timeSlots
          .map(() => "(?, ?, ?)")
          .join(", ")}`,
        timeSlots.flat()
      );
    }

    // Insert current fuel prices
    await db.execute(`
      INSERT INTO fuel_prices (fuel_type, price_per_liter, effective_date, is_current) VALUES
      ('gasoline', 1.45, CURDATE(), TRUE),
      ('diesel', 1.52, CURDATE(), TRUE),
      ('premium', 1.68, CURDATE(), TRUE)
      ON DUPLICATE KEY UPDATE 
      price_per_liter = VALUES(price_per_liter),
      updated_at = CURRENT_TIMESTAMP
    `);

    return NextResponse.json({
      success: true,
      message: "Booking system tables created successfully with sample data",
    });
  } catch (error) {
    console.error("Database setup error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to set up booking system tables" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Check if tables exist and get counts
    const [timeSlots] = await db.execute(
      "SELECT COUNT(*) as count FROM time_slots"
    );
    const [fuelPrices] = await db.execute(
      "SELECT COUNT(*) as count FROM fuel_prices"
    );
    const [bookings] = await db.execute(
      "SELECT COUNT(*) as count FROM bookings"
    );

    return NextResponse.json({
      success: true,
      tables: {
        time_slots: (timeSlots as any)[0].count,
        fuel_prices: (fuelPrices as any)[0].count,
        bookings: (bookings as any)[0].count,
      },
    });
  } catch (error) {
    console.error("Database check error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check booking system tables" },
      { status: 500 }
    );
  }
}

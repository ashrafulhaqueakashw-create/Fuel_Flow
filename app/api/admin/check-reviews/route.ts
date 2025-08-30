import { NextRequest, NextResponse } from "next/server";
import { createConnection } from "../../../../lib/db";

// Endpoint to check and fix the reviews table structure
export async function GET(request: NextRequest) {
  try {
    const connection = await createConnection();

    // Check if reviews table exists and get its structure
    const [tables] = await connection.execute("SHOW TABLES LIKE 'reviews'");

    if ((tables as any[]).length === 0) {
      await connection.end();
      return NextResponse.json({
        success: false,
        message: "Reviews table does not exist",
      });
    }

    // Get table structure
    const [columns] = await connection.execute("DESCRIBE reviews");

    await connection.end();

    return NextResponse.json({
      success: true,
      message: "Reviews table structure",
      data: columns,
    });
  } catch (error: any) {
    console.error("Error checking reviews table:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to check reviews table",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const connection = await createConnection();

    // Drop the existing table if it exists
    await connection.execute("DROP TABLE IF EXISTS reviews");

    // Create the table with the correct structure
    const createTableSQL = `
      CREATE TABLE reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        order_id INT,
        order_number INT,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        title VARCHAR(255) NOT NULL,
        comment TEXT,
        service_type ENUM('delivery', 'product_quality', 'customer_service', 'overall') DEFAULT 'overall',
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_customer_email (customer_email),
        INDEX idx_order_number (order_number),
        INDEX idx_status (status),
        INDEX idx_service_type (service_type),
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await connection.execute(createTableSQL);
    await connection.end();

    return NextResponse.json({
      success: true,
      message: "Reviews table recreated successfully with correct structure",
    });
  } catch (error: any) {
    console.error("Error recreating reviews table:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to recreate reviews table",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createConnection } from "../../../../lib/db";

// This is a temporary endpoint to create the reviews table
export async function POST(request: NextRequest) {
  try {
    const connection = await createConnection();

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS reviews (
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
      message: "Reviews table created successfully",
    });
  } catch (error: any) {
    console.error("Error creating reviews table:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create reviews table",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

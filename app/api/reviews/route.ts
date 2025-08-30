import { NextRequest, NextResponse } from "next/server";
import { createConnection } from "@/lib/db";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");
    const customerEmail = searchParams.get("customer_email");
    const status = searchParams.get("status");
    const serviceType = searchParams.get("serviceType");
    const limit = searchParams.get("limit");

    const connection = await createConnection();

    let query = `
      SELECT r.*, c.name as customer_name, c.email as customer_email,
             o.id as order_number
      FROM reviews r
      LEFT JOIN customers c ON r.customer_id = c.id
      LEFT JOIN orders o ON r.order_id = o.id
      ORDER BY r.created_at DESC
    `;
    let params: any[] = [];

    // Build WHERE conditions
    let whereConditions: string[] = [];

    if (customerId) {
      whereConditions.push("r.customer_id = ?");
      params.push(customerId);
    }

    if (customerEmail) {
      whereConditions.push("r.customer_email = ?");
      params.push(customerEmail);
    }

    if (status) {
      whereConditions.push("r.status = ?");
      params.push(status);
    }

    if (serviceType) {
      whereConditions.push("r.service_type = ?");
      params.push(serviceType);
    }

    // Add WHERE clause if any conditions exist
    if (whereConditions.length > 0) {
      query = `
        SELECT r.*, c.name as customer_name, c.email as customer_email,
               o.id as order_number
        FROM reviews r
        LEFT JOIN customers c ON r.customer_id = c.id
        LEFT JOIN orders o ON r.order_id = o.id
        WHERE ${whereConditions.join(" AND ")}
        ORDER BY r.created_at DESC
      `;
    }

    // Add LIMIT if specified
    if (limit) {
      query += ` LIMIT ?`;
      params.push(parseInt(limit));
    }

    const [rows] = await connection.execute(query, params);
    await connection.end();

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      rating,
      title,
      comment,
      service_type,
      order_id,
      order_number,
      customer_email,
      customer_name,
    } = body;

    if (!rating || !title || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: "Rating (1-5) and title are required" },
        { status: 400 }
      );
    }

    let customerId = null;
    let customerEmailFinal = customer_email;
    let customerNameFinal = customer_name;

    // Try to get customer info from token first
    const cookies = request.headers.get("cookie");
    const token = cookies
      ?.split(";")
      .find((c) => c.trim().startsWith("token="))
      ?.split("=")[1];

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        customerId = decoded.id;

        // If we have a valid token, get customer details from database
        if (customerId) {
          const connection = await createConnection();
          const [customerRows] = await connection.execute(
            "SELECT name, email FROM customers WHERE id = ?",
            [customerId]
          );
          const customers = customerRows as any[];

          if (customers.length > 0) {
            customerEmailFinal = customers[0].email;
            customerNameFinal = customers[0].name;
          }
          connection.end();
        }
      } catch (tokenError) {
        console.error("Token verification failed:", tokenError);
        // Continue without authentication - we'll try to get customer info from request
      }
    }

    // If no valid token and no customer info provided, return error
    if (!customerId && (!customer_email || !customer_name)) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required or customer information missing",
        },
        { status: 401 }
      );
    }

    // If no customerId from token, try to find customer by email
    if (!customerId && customer_email) {
      const connection = await createConnection();
      const [customerRows] = await connection.execute(
        "SELECT id FROM customers WHERE email = ?",
        [customer_email]
      );
      const customers = customerRows as any[];

      if (customers.length > 0) {
        customerId = customers[0].id;
      }
      connection.end();
    }

    const connection = await createConnection();

    const [result] = await connection.execute(
      `INSERT INTO reviews (customer_id, customer_name, customer_email, order_id, order_number, rating, title, comment, service_type, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        customerId,
        customerNameFinal,
        customerEmailFinal,
        order_id || null,
        order_number || null,
        rating,
        title,
        comment || null,
        service_type || "overall",
      ]
    );

    await connection.end();

    return NextResponse.json({
      success: true,
      message: "Review submitted successfully",
      data: { id: (result as any).insertId },
    });
  } catch (error) {
    console.error("Create review error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit review" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createConnection } from "@/lib/db";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  try {
    // Verify customer authentication
    const cookies = request.headers.get("cookie");
    const token = cookies
      ?.split(";")
      .find((c) => c.trim().startsWith("token="))
      ?.split("=")[1];

    let customerId = null;
    let customerEmail = null;

    // Try to get customer info from JWT token
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        customerId = decoded.id;
        customerEmail = decoded.email;
      } catch (jwtError) {
        console.log(
          "JWT token expired or invalid - continuing without authentication"
        );
      }
    }

    const connection = await createConnection();

    // If we have customer info, fetch their bookings
    let bookings = [];

    if (customerId) {
      // Fetch by customer ID
      const [bookingResult] = await connection.execute(
        `
        SELECT 
          b.*,
          ts.date,
          ts.start_time,
          ts.end_time,
          ts.congestion_level,
          c.name as customer_name,
          c.email as customer_email
        FROM bookings b
        JOIN time_slots ts ON b.time_slot_id = ts.id
        JOIN customers c ON b.customer_id = c.id
        WHERE b.customer_id = ?
        ORDER BY ts.date DESC, ts.start_time DESC
      `,
        [customerId]
      );
      bookings = bookingResult as any[];
    } else {
      // Try to fetch all recent bookings when JWT is expired
      const [bookingResult] = await connection.execute(
        `
        SELECT 
          b.*,
          ts.date,
          ts.start_time,
          ts.end_time,
          ts.congestion_level
        FROM bookings b
        JOIN time_slots ts ON b.time_slot_id = ts.id
        ORDER BY ts.date DESC, ts.start_time DESC
        LIMIT 50
        `
      );
      bookings = bookingResult as any[];
    }

    await connection.end();

    return NextResponse.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify customer authentication
    const cookies = request.headers.get("cookie");
    const token = cookies
      ?.split(";")
      .find((c) => c.trim().startsWith("token="))
      ?.split("=")[1];

    let customerId = null;
    let customerEmail = null;
    let customerName = null;

    // Try to get customer info from JWT token
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        customerId = decoded.id;
        customerEmail = decoded.email;
        customerName = decoded.name;
      } catch (jwtError) {
        console.log("JWT verification failed:", jwtError);
        // Token expired or invalid, we'll get customer info from request body
      }
    }

    const body = await request.json();
    const {
      time_slot_id,
      fuel_type,
      quantity_liters,
      delivery_address,
      payment_method,
      special_instructions,
      customer_email,
      customer_name,
    } = body;

    // Use customer info from token if available, otherwise from request body
    const finalCustomerEmail = customerEmail || customer_email;
    const finalCustomerName = customerName || customer_name;

    if (!finalCustomerEmail || !finalCustomerName) {
      return NextResponse.json(
        { success: false, message: "Customer information required" },
        { status: 400 }
      );
    }
    if (!time_slot_id || !fuel_type || !quantity_liters || !delivery_address) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const connection = await createConnection();

    // Try to find customer ID by email if we don't have one from JWT
    let finalCustomerId = customerId;
    if (!finalCustomerId && finalCustomerEmail) {
      try {
        const [customerResult] = await connection.execute(
          `
          SELECT id FROM customers WHERE email = ?
        `,
          [finalCustomerEmail]
        );

        const customers = customerResult as any[];
        if (customers.length > 0) {
          finalCustomerId = customers[0].id;
        }
      } catch (error) {
        console.log("Could not find customer by email:", error);
      }
    }

    // If still no customer ID, we'll need to handle this case
    if (!finalCustomerId) {
      // For now, we'll insert NULL and let the database handle it
      // Alternatively, you might want to create a guest customer record
      finalCustomerId = null;
    }

    // Check if time slot is still available
    const [slotCheck] = await connection.execute(
      `
      SELECT *, (max_capacity - current_bookings) as available_capacity
      FROM time_slots
      WHERE id = ? AND is_available = TRUE AND date >= CURDATE()
    `,
      [time_slot_id]
    );

    const slots = slotCheck as any[];
    if (slots.length === 0 || slots[0].available_capacity <= 0) {
      await connection.end();
      return NextResponse.json(
        { success: false, message: "Time slot is no longer available" },
        { status: 400 }
      );
    }

    const slot = slots[0];

    // Get current fuel price
    const [priceResult] = await connection.execute(
      `
      SELECT price_per_liter
      FROM fuel_prices
      WHERE fuel_type = ? AND is_current = TRUE
    `,
      [fuel_type]
    );

    const prices = priceResult as any[];
    if (prices.length === 0) {
      await connection.end();
      return NextResponse.json(
        { success: false, message: "Fuel price not found" },
        { status: 400 }
      );
    }

    const pricePerLiter = prices[0].price_per_liter;
    const totalAmount = quantity_liters * pricePerLiter;
    const discountAmount = (totalAmount * slot.discount_percentage) / 100;
    const finalAmount = totalAmount - discountAmount;

    // Create the booking
    const [bookingResult] = await connection.execute(
      `
      INSERT INTO bookings (
        customer_id, customer_email, customer_name, time_slot_id, fuel_type, quantity_liters, 
        price_per_liter, total_amount, discount_applied, final_amount,
        delivery_address, payment_method, special_instructions
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        finalCustomerId,
        finalCustomerEmail,
        finalCustomerName,
        time_slot_id,
        fuel_type,
        quantity_liters,
        pricePerLiter,
        totalAmount,
        slot.discount_percentage,
        finalAmount,
        delivery_address,
        payment_method || "card",
        special_instructions,
      ]
    );

    // Update time slot booking count
    await connection.execute(
      `
      UPDATE time_slots 
      SET current_bookings = current_bookings + 1,
          congestion_level = CASE 
            WHEN (current_bookings + 1) >= (max_capacity * 0.8) THEN 'high'
            WHEN (current_bookings + 1) >= (max_capacity * 0.5) THEN 'medium'
            ELSE 'low'
          END
      WHERE id = ?
    `,
      [time_slot_id]
    );

    await connection.end();

    return NextResponse.json({
      success: true,
      message: "Booking created successfully",
      data: {
        booking_id: (bookingResult as any).insertId,
        total_amount: totalAmount,
        discount_applied: slot.discount_percentage,
        final_amount: finalAmount,
      },
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create booking" },
      { status: 500 }
    );
  }
}

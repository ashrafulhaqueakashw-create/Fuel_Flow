import { NextRequest, NextResponse } from "next/server";
import { createConnection } from "../../../../lib/db";
import jwt from "jsonwebtoken";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication (you might want to add admin role check)
    const cookies = request.headers.get("cookie");
    const token = cookies
      ?.split(";")
      .find((c) => c.trim().startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET!);
    } catch (jwtError) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const bookingId = id;
    const body = await request.json();
    const { booking_status, payment_status } = body;

    const connection = await createConnection();

    // Build dynamic update query based on what fields are provided
    const updates = [];
    const values = [];

    if (booking_status) {
      updates.push("booking_status = ?");
      values.push(booking_status);
    }

    if (payment_status) {
      updates.push("payment_status = ?");
      values.push(payment_status);
    }

    if (updates.length === 0) {
      await connection.end();
      return NextResponse.json(
        { success: false, message: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Add updated_at timestamp
    updates.push("updated_at = CURRENT_TIMESTAMP");
    values.push(bookingId);

    const query = `UPDATE bookings SET ${updates.join(", ")} WHERE id = ?`;

    const [result] = await connection.execute(query, values);

    await connection.end();

    const updateResult = result as any;
    if (updateResult.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Booking updated successfully",
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update booking" },
      { status: 500 }
    );
  }
}

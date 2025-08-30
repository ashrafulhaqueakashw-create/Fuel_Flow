import { NextRequest, NextResponse } from "next/server";
import { createConnection } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const connection = await createConnection();

    const [rows] = await connection.execute(
      `SELECT r.*, c.name as customer_name, c.email as customer_email,
              o.id as order_number
       FROM reviews r
       LEFT JOIN customers c ON r.customer_id = c.id
       LEFT JOIN orders o ON r.order_id = o.id
       WHERE r.id = ?`,
      [parseInt(id)]
    );

    await connection.end();

    if ((rows as any[]).length === 0) {
      return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: (rows as any[])[0],
    });
  } catch (error) {
    console.error("Get review error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch review" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid status is required (pending, approved, rejected)",
        },
        { status: 400 }
      );
    }

    const connection = await createConnection();

    const [result] = await connection.execute(
      `UPDATE reviews SET status = ?, updated_at = NOW() WHERE id = ?`,
      [status, parseInt(id)]
    );

    await connection.end();

    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Review ${status} successfully`,
    });
  } catch (error) {
    console.error("Update review error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update review" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const connection = await createConnection();

    const [result] = await connection.execute(
      "DELETE FROM reviews WHERE id = ?",
      [parseInt(id)]
    );

    await connection.end();

    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete review" },
      { status: 500 }
    );
  }
}

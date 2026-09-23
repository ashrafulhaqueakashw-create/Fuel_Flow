import { NextRequest, NextResponse } from "next/server";
import { createConnection } from "@/lib/db";

export type FuelPriceRecord = {
  id: number;
  fuel_type: string;
  price_per_liter: number;
  effective_date: string;
  is_current: boolean;
};

// Fallback prices in case of connection failure
const FALLBACK_PRICES = [
  { id: 1, fuel_type: "gasoline", price_per_liter: 130.0, is_current: 1 },
  { id: 2, fuel_type: "diesel", price_per_liter: 105.0, is_current: 1 },
  { id: 3, fuel_type: "premium", price_per_liter: 125.0, is_current: 1 },
  { id: 4, fuel_type: "cng", price_per_liter: 48.5, is_current: 1 },
];

export async function GET() {
  try {
    const conn = await createConnection();
    const [rows]: any = await conn.execute(
      "SELECT id, fuel_type, price_per_liter, effective_date, is_current FROM fuel_prices ORDER BY id ASC"
    );
    await conn.end();

    if (Array.isArray(rows) && rows.length > 0) {
      return NextResponse.json({ success: true, data: rows });
    }

    return NextResponse.json({ success: true, data: FALLBACK_PRICES });
  } catch (error) {
    console.error("Error fetching fuel prices:", error);
    return NextResponse.json({ success: true, data: FALLBACK_PRICES });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { prices } = body; // Array of { id?: number, fuel_type: string, price_per_liter: number } or single item

    const conn = await createConnection();

    if (Array.isArray(prices)) {
      for (const item of prices) {
        const rate = parseFloat(item.price_per_liter);
        if (isNaN(rate) || rate <= 0) continue;

        if (item.id) {
          await conn.execute(
            "UPDATE fuel_prices SET price_per_liter = ?, effective_date = CURDATE(), updated_at = NOW() WHERE id = ?",
            [rate, item.id]
          );
        } else if (item.fuel_type) {
          await conn.execute(
            "UPDATE fuel_prices SET price_per_liter = ?, effective_date = CURDATE(), updated_at = NOW() WHERE fuel_type = ?",
            [rate, item.fuel_type]
          );
        }
      }
    } else if (body.fuel_type && body.price_per_liter) {
      const rate = parseFloat(body.price_per_liter);
      if (body.id) {
        await conn.execute(
          "UPDATE fuel_prices SET price_per_liter = ?, effective_date = CURDATE(), updated_at = NOW() WHERE id = ?",
          [rate, body.id]
        );
      } else {
        await conn.execute(
          "UPDATE fuel_prices SET price_per_liter = ?, effective_date = CURDATE(), updated_at = NOW() WHERE fuel_type = ?",
          [rate, body.fuel_type]
        );
      }
    }

    const [updatedRows]: any = await conn.execute(
      "SELECT id, fuel_type, price_per_liter, effective_date, is_current FROM fuel_prices ORDER BY id ASC"
    );
    await conn.end();

    return NextResponse.json({
      success: true,
      message: "Fuel prices updated successfully",
      data: updatedRows,
    });
  } catch (error: any) {
    console.error("Error updating fuel prices:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update prices" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fuel_type, price_per_liter } = body;

    if (!fuel_type || !price_per_liter) {
      return NextResponse.json(
        { success: false, message: "Fuel type and price are required" },
        { status: 400 }
      );
    }

    const conn = await createConnection();
    const [existing]: any = await conn.execute(
      "SELECT id FROM fuel_prices WHERE fuel_type = ?",
      [fuel_type]
    );

    if (existing.length > 0) {
      await conn.execute(
        "UPDATE fuel_prices SET price_per_liter = ?, effective_date = CURDATE(), is_current = 1 WHERE fuel_type = ?",
        [price_per_liter, fuel_type]
      );
    } else {
      await conn.execute(
        "INSERT INTO fuel_prices (fuel_type, price_per_liter, effective_date, is_current) VALUES (?, ?, CURDATE(), 1)",
        [fuel_type, price_per_liter]
      );
    }

    const [rows]: any = await conn.execute(
      "SELECT id, fuel_type, price_per_liter, effective_date, is_current FROM fuel_prices ORDER BY id ASC"
    );
    await conn.end();

    return NextResponse.json({
      success: true,
      message: "Fuel price saved successfully",
      data: rows,
    });
  } catch (error: any) {
    console.error("Error saving fuel price:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to save price" },
      { status: 500 }
    );
  }
}

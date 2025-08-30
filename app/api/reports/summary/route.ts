import { NextResponse } from "next/server";
import { createConnection } from "@/lib/db";

export const GET = async () => {
  try {
    const conn = await createConnection();

    // Count currently checked-in staff (present today)
    const [[{ staffPresent }]]: any = await conn.execute(
      `SELECT COUNT(DISTINCT employee_id) as staffPresent 
       FROM attendance 
       WHERE DATE(shift_start) = DATE(NOW()) AND shift_end IS NULL`
    );

    const [[{ openOrders }]]: any = await conn.execute(
      `SELECT COUNT(*) as openOrders FROM orders WHERE status NOT IN ('delivered','cancelled')`
    );

    const [[{ lowStock }]]: any = await conn.execute(
      `SELECT COUNT(*) as lowStock FROM inventory_items WHERE quantity < 10`
    );

    const [[{ workingHours }]]: any = await conn.execute(
      `SELECT COALESCE(SUM(TIME_TO_SEC(TIMEDIFF(IFNULL(shift_end,NOW()), shift_start))/3600),0) as workingHours FROM attendance WHERE DATE(shift_start) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`
    );

    await conn.end();

    console.log(
      "Dashboard summary - Staff present:",
      staffPresent,
      "Open orders:",
      openOrders
    );

    return NextResponse.json({
      staffPresent: staffPresent || 0,
      workingHours: workingHours || 0,
      openOrders: openOrders || 0,
      lowStock: lowStock || 0,
    });
  } catch (error) {
    console.error("Summary API error:", error);
    return NextResponse.json(
      {
        staffPresent: 0,
        workingHours: 0,
        openOrders: 0,
        lowStock: 0,
        error: "Failed to fetch summary",
      },
      { status: 500 }
    );
  }
};

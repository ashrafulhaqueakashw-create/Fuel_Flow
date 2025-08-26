import { NextResponse } from "next/server";
import { createConnection } from "@/lib/db";

export const GET = async () => {
  const conn = await createConnection();

  // Simple counts - replace with real calculations as needed
  const [[{ staffCount }]]: any = await conn.execute(
    `SELECT COUNT(*) as staffCount FROM employees`
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

  return NextResponse.json({
    staffPresent: staffCount || 0,
    workingHours: workingHours || 0,
    openOrders: openOrders || 0,
    lowStock: lowStock || 0,
  });
};

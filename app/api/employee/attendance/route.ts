import { NextRequest, NextResponse } from "next/server";
import { createConnection } from "@/lib/db";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    // Verify employee authentication
    const cookies = request.headers.get("cookie");
    const token = cookies
      ?.split(";")
      .find((c) => c.trim().startsWith("employee_token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const employeeId = decoded.id; // Use 'id' not 'employeeId'

    if (!employeeId) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    const connection = await createConnection();

    // Check if employee is already checked in today
    const [existingRows] = await connection.execute(
      `SELECT id, shift_start, shift_end FROM attendance 
       WHERE employee_id = ? AND DATE(shift_start) = CURDATE() AND shift_end IS NULL`,
      [employeeId]
    );

    const existingAttendance = existingRows as any[];

    if (existingAttendance.length > 0) {
      // Employee is checked in, so this is a check-out
      const attendanceId = existingAttendance[0].id;

      const [result] = await connection.execute(
        `UPDATE attendance SET shift_end = NOW() WHERE id = ?`,
        [attendanceId]
      );

      console.log(
        "Check-out record updated for employee:",
        employeeId,
        "Attendance ID:",
        attendanceId,
        "Result:",
        result
      );

      await connection.end();

      return NextResponse.json({
        success: true,
        action: "checkout",
        message: "Checked out successfully",
      });
    } else {
      // Employee is not checked in, so this is a check-in
      const [result] = await connection.execute(
        `INSERT INTO attendance (employee_id, shift_start) VALUES (?, NOW())`,
        [employeeId]
      );

      console.log(
        "Check-in record created for employee:",
        employeeId,
        "Result:",
        result
      );

      await connection.end();

      return NextResponse.json({
        success: true,
        action: "checkin",
        message: "Checked in successfully",
      });
    }
  } catch (error) {
    console.error("Attendance error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process attendance" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify employee authentication
    const cookies = request.headers.get("cookie");
    const token = cookies
      ?.split(";")
      .find((c) => c.trim().startsWith("employee_token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const employeeId = decoded.id; // Use 'id' not 'employeeId'

    if (!employeeId) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    const connection = await createConnection();

    // Check current attendance status
    const [rows] = await connection.execute(
      `SELECT id, shift_start, shift_end FROM attendance 
       WHERE employee_id = ? AND DATE(shift_start) = CURDATE() AND shift_end IS NULL`,
      [employeeId]
    );

    await connection.end();

    const isCheckedIn = (rows as any[]).length > 0;
    const checkInTime = isCheckedIn ? (rows as any[])[0].shift_start : null;

    return NextResponse.json({
      success: true,
      isCheckedIn,
      checkInTime,
    });
  } catch (error) {
    console.error("Get attendance status error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to get attendance status" },
      { status: 500 }
    );
  }
}

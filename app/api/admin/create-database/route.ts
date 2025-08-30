import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function POST(request: NextRequest) {
  try {
    // Connect without specifying a database
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
    });

    // Create the database if it doesn't exist
    await connection.execute("CREATE DATABASE IF NOT EXISTS fuelflow");

    await connection.end();

    return NextResponse.json({
      success: true,
      message: "Database fuelflow created successfully",
    });
  } catch (error) {
    console.error("Database creation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create database" },
      { status: 500 }
    );
  }
}

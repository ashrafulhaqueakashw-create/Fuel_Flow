import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function POST(request: NextRequest) {
  try {
    const host = process.env.DB_HOST || "localhost";
    const isRemote = host !== "localhost" && host !== "127.0.0.1";
    const useSSL = process.env.DB_SSL === "true" || (isRemote && process.env.DB_SSL !== "false");
    const dbName = process.env.DB_NAME || "fuelflow";

    // Connect without specifying a database
    const connection = await mysql.createConnection({
      host: host,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      ssl: useSSL ? { rejectUnauthorized: false } : undefined,
    });

    // Create the database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);

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

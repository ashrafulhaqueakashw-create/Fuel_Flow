import mysql from "mysql2/promise";

const getDbConfig = () => {
  const host = process.env.DB_HOST || "localhost";
  const isRemote = host !== "localhost" && host !== "127.0.0.1";
  const useSSL = process.env.DB_SSL === "true" || (isRemote && process.env.DB_SSL !== "false");

  return {
    host: host,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "fuelflow",
    ssl: useSSL ? { rejectUnauthorized: false } : undefined,
  };
};

export const createConnection = async () => {
  return await mysql.createConnection(getDbConfig());
};

export const getPool = () => {
  return mysql.createPool({
    ...getDbConfig(),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
};



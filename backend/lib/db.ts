import msql from "mysql2/promise";

let connection: msql.Connection;

export const createConnection = async () => {
  connection = await msql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  return connection;
};

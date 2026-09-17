import mysql from "mysql2/promise";
import type { Config } from "../../config/src/index.js";
export function createDatabase(config: Config) {
  return mysql.createPool({
    host: config.MYSQL_HOST,
    port: config.MYSQL_PORT,
    database: config.MYSQL_DATABASE,
    user: config.MYSQL_USER,
    password: config.MYSQL_PASSWORD,
    ssl:
      config.MYSQL_SSL_MODE === "required"
        ? { rejectUnauthorized: true }
        : undefined,
    connectionLimit: 10,
    connectTimeout: 5000,
  });
}

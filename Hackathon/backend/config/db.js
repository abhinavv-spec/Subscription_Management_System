import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { localSqlEngine } from './sqlEngine.js';

dotenv.config();

let pool = null;
let isConnectedToMySQL = false;

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'brightloop_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Initialize DB connection
export async function initDB() {
  try {
    // Attempt connecting to MySQL server
    pool = mysql.createPool(dbConfig);
    const conn = await pool.getConnection();
    console.log(`[DB] Successfully connected to MySQL at ${dbConfig.host}:${dbConfig.port} (database: ${dbConfig.database})`);
    conn.release();
    isConnectedToMySQL = true;
  } catch (err) {
    console.warn(`[DB Warning] MySQL connection failed (${err.code || err.message}).`);
    console.log(`[DB Info] Running embedded local relational SQL engine for uninterrupted development & demonstration.`);
    isConnectedToMySQL = false;
  }
}

// Universal query dispatcher
export const db = {
  async query(sql, params = []) {
    if (isConnectedToMySQL && pool) {
      try {
        return await pool.query(sql, params);
      } catch (err) {
        console.error('[MySQL Error]', err.message);
        // Fallback to local SQL if a query fails or connection drops
        return await localSqlEngine.query(sql, params);
      }
    }
    return await localSqlEngine.query(sql, params);
  },

  isMySQL() {
    return isConnectedToMySQL;
  }
};

export default db;


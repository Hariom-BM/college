import pkg from 'pg';
import { CONFIG } from './config.js';

const { Pool } = pkg;
export const pool = new Pool({ connectionString: CONFIG.DATABASE_URL, ssl: { rejectUnauthorized: false } });

export async function query(sql, params) {
  const client = await pool.connect();
  try {
    return await client.query(sql, params);
  } finally {
    client.release();
  }
}

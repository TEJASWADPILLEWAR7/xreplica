import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./drizzle/schema";

/**
 * DATABASE FIX FOR VERCEL 500 ERRORS:
 * 1. Implements a Singleton pattern to prevent "Too many connections" errors.
 * 2. Forces SSL mode for production environments.
 * 3. Sets a connection timeout to prevent hanging functions.
 */

// Global variable to persist the pool across hot-reloads in development
// and across serverless function invocations in production.
const globalForDb = global as unknown as { pool: Pool | undefined };

const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    // Recommended settings for Serverless/Vercel
    max: 5, // Keep this low so multiple Vercel instances don't crash your DB
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

// Export the drizzle instance
export const db = drizzle(pool, { schema });

// Helper to check connection health (useful for debugging 500 errors)
export const checkConnection = async () => {
  try {
    const client = await pool.connect();
    client.release();
    return { success: true };
  } catch (err: any) {
    console.error("Database connection failed:", err.message);
    return { success: false, error: err.message };
  }
};

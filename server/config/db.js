import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

// Initialize the connection pool using  Supabase URI string
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Failed!", err);
  } else {
    console.log("Connected to Supabase PostgreSQL Database successfully!");
  }
});

export const db = {
  query: (text, params) => pool.query(text, params),
};

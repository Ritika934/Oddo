import pkg from "pg";
import "./env.js";

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});
console.log("reached here ")
pool.connect()
  .then(() => {
    console.log("Connected to Database");
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });

export default pool;

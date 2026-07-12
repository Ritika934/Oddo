import pool from "./config/Db.js";

async function inspectTables() {
  try {
    const tripsCols = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'trips'
    `);
    console.log("trips columns:", tripsCols.rows.map(r => r.column_name));

    const vehiclesCols = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'vehicles'
    `);
    console.log("vehicles columns:", vehiclesCols.rows.map(r => r.column_name));
  } catch (err) {
    console.error("DB error:", err);
  } finally {
    await pool.end();
  }
}

inspectTables();

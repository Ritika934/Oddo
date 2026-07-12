import pool from "../../config/Db.js";

export const addGpsLog = async (trip_id, latitude, longitude, client) => {
  const query = `
    INSERT INTO gps_logs (trip_id, latitude, longitude)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const db = client || pool;
  const { rows } = await db.query(query, [trip_id, latitude, longitude]);
  return rows[0];
};

export const getGpsLogsForTrip = async (trip_id) => {
  const query = `
    SELECT *
    FROM gps_logs
    WHERE trip_id = $1
    ORDER BY recorded_at ASC;
  `;
  const { rows } = await pool.query(query, [trip_id]);
  return rows;
};

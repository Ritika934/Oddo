import pool from "../../config/Db.js";

export const createTrip = async (tripData, client) => {
  const {
    route,
    vehicle_id,
    driver_id,
    cargo_weight,
    status = "Draft",
    odometer_start = null,
    odometer_end = null
  } = tripData;

  const trip_code = tripData.trip_code || `TRP-${Math.floor(100000 + Math.random() * 900000)}`;

  const query = `
    INSERT INTO trips
    (
      trip_code,
      route,
      vehicle_id,
      driver_id,
      cargo_weight,
      status,
      odometer_start,
      odometer_end
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
  `;

  const values = [
    trip_code,
    route,
    vehicle_id,
    driver_id,
    cargo_weight,
    status,
    odometer_start,
    odometer_end
  ];

  const db = client || pool;
  const { rows } = await db.query(query, values);
  return rows[0];
};

export const getTripById = async (id, client) => {
  const query = `
    SELECT t.*, 
           v.vehicle_name, v.registration_number, v.max_load_capacity, v.odometer as vehicle_odometer, v.status as vehicle_status,
           d.name as driver_name, d.phone as driver_phone, d.license_number, d.license_expiry, d.status as driver_status
    FROM trips t
    JOIN vehicles v ON t.vehicle_id = v.id
    JOIN drivers d ON t.driver_id = d.id
    WHERE t.id = $1;
  `;
  const db = client || pool;
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

export const getAllTrips = async (
  search = "",
  status = "",
  page = 1,
  limit = 10
) => {
  let query = `
    SELECT t.*, v.registration_number as vehicle_reg, d.name as driver_name
    FROM trips t
    JOIN vehicles v ON t.vehicle_id = v.id
    JOIN drivers d ON t.driver_id = d.id
    WHERE
      (
        t.trip_code ILIKE $1
        OR t.route ILIKE $1
        OR v.registration_number ILIKE $1
        OR d.name ILIKE $1
      )
  `;

  const values = [`%${search}%`];
  const offset = (page - 1) * limit;

  if (status) {
    query += ` AND t.status = $2`;
    values.push(status);
  }

  query += `
    ORDER BY t.created_at DESC
    LIMIT $${values.length + 1}
    OFFSET $${values.length + 2}
  `;

  values.push(limit);
  values.push(offset);

  const { rows } = await pool.query(query, values);
  return rows;
};

export const updateTrip = async (id, data, client) => {
  const {
    route,
    vehicle_id,
    driver_id,
    cargo_weight,
    status,
    odometer_start,
    odometer_end
  } = data;

  const query = `
    UPDATE trips
    SET
      route = $1,
      vehicle_id = $2,
      driver_id = $3,
      cargo_weight = $4,
      status = $5,
      odometer_start = $6,
      odometer_end = $7,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $8
    RETURNING *;
  `;

  const values = [
    route,
    vehicle_id,
    driver_id,
    cargo_weight,
    status,
    odometer_start,
    odometer_end,
    id
  ];

  const db = client || pool;
  const { rows } = await db.query(query, values);
  return rows[0];
};

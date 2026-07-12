import pool from "../../config/Db.js";

export const createFuelLog = async (data) => {
  const {
    vehicle_id,
    fill_date,
    liters,
    cost,
    odometer
  } = data;

  const query = `
    INSERT INTO fuel_logs
    (
      vehicle_id,
      fill_date,
      liters,
      cost,
      odometer
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;

  const values = [
    vehicle_id,
    fill_date,
    liters,
    cost,
    odometer
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
};

export const getFuelLogById = async (id) => {
  const query = `
    SELECT f.*, v.registration_number, v.vehicle_name
    FROM fuel_logs f
    JOIN vehicles v ON f.vehicle_id = v.id
    WHERE f.id = $1;
  `;

  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

export const getAllFuelLogs = async (vehicle_id = "", page = 1, limit = 10) => {
  let query = `
    SELECT f.*, v.registration_number, v.vehicle_name
    FROM fuel_logs f
    JOIN vehicles v ON f.vehicle_id = v.id
  `;

  const values = [];
  
  if (vehicle_id) {
    query += ` WHERE f.vehicle_id = $1`;
    values.push(vehicle_id);
  }

  const offset = (page - 1) * limit;

  query += `
    ORDER BY f.fill_date DESC, f.created_at DESC
    LIMIT $${values.length + 1}
    OFFSET $${values.length + 2}
  `;

  values.push(limit);
  values.push(offset);

  const { rows } = await pool.query(query, values);
  return rows;
};

export const updateFuelLog = async (id, data) => {
  const {
    vehicle_id,
    fill_date,
    liters,
    cost,
    odometer
  } = data;

  const query = `
    UPDATE fuel_logs
    SET
      vehicle_id = $1,
      fill_date = $2,
      liters = $3,
      cost = $4,
      odometer = $5,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $6
    RETURNING *;
  `;

  const values = [
    vehicle_id,
    fill_date,
    liters,
    cost,
    odometer,
    id
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
};

export const deleteFuelLog = async (id) => {
  const query = `
    DELETE FROM fuel_logs
    WHERE id = $1
    RETURNING *;
  `;

  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

export const getFuelLogsForVehicle = async (vehicle_id) => {
  const query = `
    SELECT *
    FROM fuel_logs
    WHERE vehicle_id = $1
    ORDER BY odometer ASC, fill_date ASC;
  `;

  const { rows } = await pool.query(query, [vehicle_id]);
  return rows;
};

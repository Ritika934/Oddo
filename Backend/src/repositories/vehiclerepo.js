import pool from "../../config/Db.js";

export const findVehicleByRegistration = async (registrationNumber) => {
  const query =
    "SELECT * FROM vehicles WHERE registration_number = $1";

  const { rows } = await pool.query(query, [registrationNumber]);

  return rows[0];
};

export const createVehicle = async (vehicleData) => {
  const {
    registration_number,
    vehicle_name,
    model,
    vehicle_type,
    max_load_capacity,
    odometer,
    acquisition_cost,
  } = vehicleData;

  const query = `
    INSERT INTO vehicles
    (
      registration_number,
      vehicle_name,
      model,
      vehicle_type,
      max_load_capacity,
      odometer,
      acquisition_cost
    )
    VALUES($1,$2,$3,$4,$5,$6,$7)
    RETURNING *;
  `;

  const values = [
    registration_number,
    vehicle_name,
    model,
    vehicle_type,
    max_load_capacity,
    odometer || 0,
    acquisition_cost,
  ];

  const { rows } = await pool.query(query, values);

  return rows[0];
};
export const getAllVehicles = async (
  search = "",
  status = "",
  page = 1,
  limit = 10
) =>{
  let query = `
    SELECT *
    FROM vehicles
    WHERE
      (
        vehicle_name ILIKE $1
        OR registration_number ILIKE $1
        OR vehicle_type ILIKE $1
      )
  `;

 const values = [`%${search}%`];

const offset = (page - 1) * limit;
  if (status) {
    query += ` AND status = $2`;
    values.push(status);
  }

query += `
ORDER BY created_at DESC
LIMIT $${values.length + 1}
OFFSET $${values.length + 2}
`;

values.push(limit);
values.push(offset);
  const { rows } = await pool.query(query, values);

  return rows;
};
export const getVehicleById = async (id, client) => {
  const db = client || pool;
  const query = `
    SELECT * FROM vehicles
    WHERE id = $1;
  `;

  const { rows } = await db.query(query, [id]);

  return rows[0];
};
export const updateVehicle = async (id, vehicleData, client) => {
  const {
    registration_number,
    vehicle_name,
    model,
    vehicle_type,
    max_load_capacity,
    odometer,
    acquisition_cost,
    status,
  } = vehicleData;

  const query = `
    UPDATE vehicles
    SET
      registration_number = $1,
      vehicle_name = $2,
      model = $3,
      vehicle_type = $4,
      max_load_capacity = $5,
      odometer = $6,
      acquisition_cost = $7,
      status = $8,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $9
    RETURNING *;
  `;

  const values = [
    registration_number,
    vehicle_name,
    model,
    vehicle_type,
    max_load_capacity,
    odometer,
    acquisition_cost,
    status,
    id,
  ];

  const db = client || pool;
  const { rows } = await db.query(query, values);

  return rows[0];
};
export const retireVehicle = async (id) => {
  const query = `
    UPDATE vehicles
    SET
      status = 'Retired',
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *;
  `;

  const { rows } = await pool.query(query, [id]);

  return rows[0];
};
export const updateVehicleStatus = async (id, status) => {

  const query = `
    UPDATE vehicles
    SET
      status = $1,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *;
  `;

  const { rows } = await pool.query(query, [status, id]);

  return rows[0];
};
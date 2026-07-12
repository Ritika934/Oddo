import pool from "../../config/Db.js";


export const findDriverByLicense = async (licenseNumber) => {
  const query = `
    SELECT *
    FROM drivers
    WHERE license_number = $1;
  `;

  const { rows } = await pool.query(query, [licenseNumber]);

  return rows[0];
};

// Create driver
export const createDriver = async (driverData) => {

  const {
    name,
    phone,
    license_number,
    license_expiry
  } = driverData;


  const query = `
    INSERT INTO drivers
    (
      name,
      phone,
      license_number,
      license_expiry
    )
    VALUES($1,$2,$3,$4)
    RETURNING *;
  `;


  const values = [
    name,
    phone,
    license_number,
    license_expiry
  ];


  const { rows } = await pool.query(query, values);


  return rows[0];
};



// Get all drivers
export const getAllDrivers = async (
  search = "",
  status = "",
  page = 1,
  limit = 10
) => {
  let query = `
    SELECT *
    FROM drivers
    WHERE
      (
        name ILIKE $1
        OR phone ILIKE $1
        OR license_number ILIKE $1
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



// Get driver by id
export const getDriverById = async (id, client) => {
  const db = client || pool;
  const query = `
    SELECT *
    FROM drivers
    WHERE id=$1;
  `;

  const { rows } = await db.query(query,[id]);

  return rows[0];
};



// Update driver
export const updateDriver = async (id, driverData, client) => {

  const {
    name,
    phone,
    license_number,
    license_expiry,
    status
  } = driverData;


  const query = `
    UPDATE drivers
    SET
      name=$1,
      phone=$2,
      license_number=$3,
      license_expiry=$4,
      status=$5,
      updated_at=CURRENT_TIMESTAMP
    WHERE id=$6
    RETURNING *;
  `;


  const values=[
    name,
    phone,
    license_number,
    license_expiry,
    status,
    id
  ];


  const db = client || pool;
  const { rows } = await db.query(query,values);


  return rows[0];
};



// Suspend driver
export const suspendDriver = async (id) => {

  const query = `
    UPDATE drivers
    SET
      status='Suspended',
      updated_at=CURRENT_TIMESTAMP
    WHERE id=$1
    RETURNING *;
  `;


  const { rows } = await pool.query(query,[id]);


  return rows[0];
};
import pool from "../../config/Db.js";

export const createMaintenance = async (data, client) => {
  const {
    vehicle_id,
    description,
    cost = 0,
    status = "In Shop"
  } = data;

  const query = `
    INSERT INTO maintenance
    (
      vehicle_id,
      description,
      cost,
      status
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;

  const values = [
    vehicle_id,
    description,
    cost,
    status
  ];

  const db = client || pool;
  const { rows } = await db.query(query, values);
  return rows[0];
};

export const getMaintenanceById = async (id, client) => {
  const query = `
    SELECT m.*, v.vehicle_name, v.registration_number, v.status as vehicle_status
    FROM maintenance m
    JOIN vehicles v ON m.vehicle_id = v.id
    WHERE m.id = $1;
  `;

  const db = client || pool;
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

export const getAllMaintenance = async (
  search = "",
  status = "",
  page = 1,
  limit = 10
) => {
  let query = `
    SELECT m.*, v.registration_number as vehicle_reg, v.vehicle_name
    FROM maintenance m
    JOIN vehicles v ON m.vehicle_id = v.id
    WHERE
      (
        m.description ILIKE $1
        OR v.registration_number ILIKE $1
        OR v.vehicle_name ILIKE $1
      )
  `;

  const values = [`%${search}%`];
  const offset = (page - 1) * limit;

  if (status) {
    query += ` AND m.status = $2`;
    values.push(status);
  }

  query += `
    ORDER BY m.created_at DESC
    LIMIT $${values.length + 1}
    OFFSET $${values.length + 2}
  `;

  values.push(limit);
  values.push(offset);

  const { rows } = await pool.query(query, values);
  return rows;
};

export const updateMaintenance = async (id, data, client) => {
  const {
    status,
    cost,
    end_date
  } = data;

  const query = `
    UPDATE maintenance
    SET
      status = $1,
      cost = $2,
      end_date = $3,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $4
    RETURNING *;
  `;

  const values = [
    status,
    cost,
    end_date,
    id
  ];

  const db = client || pool;
  const { rows } = await db.query(query, values);
  return rows[0];
};

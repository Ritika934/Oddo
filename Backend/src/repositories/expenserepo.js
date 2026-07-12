import pool from "../../config/Db.js";

export const createExpense = async (data) => {
  const {
    vehicle_id,
    category,
    amount,
    expense_date,
    description
  } = data;

  const query = `
    INSERT INTO expenses
    (
      vehicle_id,
      category,
      amount,
      expense_date,
      description
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;

  const values = [
    vehicle_id,
    category,
    amount,
    expense_date,
    description || null
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
};

export const getExpenseById = async (id) => {
  const query = `
    SELECT e.*, v.registration_number, v.vehicle_name
    FROM expenses e
    JOIN vehicles v ON e.vehicle_id = v.id
    WHERE e.id = $1;
  `;

  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

export const getAllExpenses = async (vehicle_id = "", category = "", page = 1, limit = 10) => {
  let query = `
    SELECT e.*, v.registration_number as vehicle_reg, v.vehicle_name
    FROM expenses e
    JOIN vehicles v ON e.vehicle_id = v.id
  `;

  const values = [];
  
  if (vehicle_id && category) {
    query += ` WHERE e.vehicle_id = $1 AND e.category = $2`;
    values.push(vehicle_id, category);
  } else if (vehicle_id) {
    query += ` WHERE e.vehicle_id = $1`;
    values.push(vehicle_id);
  } else if (category) {
    query += ` WHERE e.category = $1`;
    values.push(category);
  }

  const offset = (page - 1) * limit;

  query += `
    ORDER BY e.expense_date DESC, e.created_at DESC
    LIMIT $${values.length + 1}
    OFFSET $${values.length + 2}
  `;

  values.push(limit);
  values.push(offset);

  const { rows } = await pool.query(query, values);
  return rows;
};

export const updateExpense = async (id, data) => {
  const {
    vehicle_id,
    category,
    amount,
    expense_date,
    description
  } = data;

  const query = `
    UPDATE expenses
    SET
      vehicle_id = $1,
      category = $2,
      amount = $3,
      expense_date = $4,
      description = $5,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $6
    RETURNING *;
  `;

  const values = [
    vehicle_id,
    category,
    amount,
    expense_date,
    description || null,
    id
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
};

export const deleteExpense = async (id) => {
  const query = `
    DELETE FROM expenses
    WHERE id = $1
    RETURNING *;
  `;

  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

export const getExpensesTotalForVehicle = async (vehicle_id) => {
  const query = `
    SELECT COALESCE(SUM(amount), 0)::numeric as total
    FROM expenses
    WHERE vehicle_id = $1;
  `;

  const { rows } = await pool.query(query, [vehicle_id]);
  return Number(rows[0].total);
};

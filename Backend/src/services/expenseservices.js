import pool from "../../config/Db.js";
import { getVehicleById } from "../repositories/vehiclerepo.js";
import {
  createExpense,
  getExpenseById,
  getAllExpenses,
  updateExpense,
  deleteExpense,
  getExpensesTotalForVehicle
} from "../repositories/expenserepo.js";

// Create Expense
export const addExpense = async (data) => {
  const vehicle = await getVehicleById(data.vehicle_id);
  if (!vehicle) {
    throw new Error("Vehicle not found");
  }
  return await createExpense(data);
};

// Fetch all Expenses
export const fetchAllExpenses = async (vehicle_id, category, page, limit) => {
  return await getAllExpenses(vehicle_id, category, page, limit);
};

// Fetch single Expense
export const fetchExpenseById = async (id) => {
  const expense = await getExpenseById(id);
  if (!expense) {
    throw new Error("Expense record not found");
  }
  return expense;
};

// Update Expense
export const editExpense = async (id, data) => {
  const existingExpense = await getExpenseById(id);
  if (!existingExpense) {
    throw new Error("Expense record not found");
  }

  const vehicle = await getVehicleById(data.vehicle_id);
  if (!vehicle) {
    throw new Error("Vehicle not found");
  }

  return await updateExpense(id, data);
};

// Delete Expense
export const removeExpense = async (id) => {
  const existingExpense = await getExpenseById(id);
  if (!existingExpense) {
    throw new Error("Expense record not found");
  }
  return await deleteExpense(id);
};

// Calculate Operational Cost
export const calculateOperationalCost = async (vehicle_id) => {
  const vehicle = await getVehicleById(vehicle_id);
  if (!vehicle) {
    throw new Error("Vehicle not found");
  }

  // 1. Sum fuel costs
  const fuelQuery = `
    SELECT COALESCE(SUM(cost), 0)::numeric as total
    FROM fuel_logs
    WHERE vehicle_id = $1;
  `;
  const { rows: fuelRows } = await pool.query(fuelQuery, [vehicle_id]);
  const fuelCost = Number(fuelRows[0].total);

  // 2. Sum completed maintenance costs
  const maintenanceQuery = `
    SELECT COALESCE(SUM(cost), 0)::numeric as total
    FROM maintenance
    WHERE vehicle_id = $1 AND status = 'Completed';
  `;
  const { rows: maintenanceRows } = await pool.query(maintenanceQuery, [vehicle_id]);
  const maintenanceCost = Number(maintenanceRows[0].total);

  // 3. Sum expenses costs
  const expenseCost = await getExpensesTotalForVehicle(vehicle_id);

  // Total
  const totalCost = fuelCost + maintenanceCost + expenseCost;

  // Breakdown percentages
  const fuelPct = totalCost > 0 ? Number(((fuelCost / totalCost) * 100).toFixed(1)) : 0;
  const maintenancePct = totalCost > 0 ? Number(((maintenanceCost / totalCost) * 100).toFixed(1)) : 0;
  const expensePct = totalCost > 0 ? Number(((expenseCost / totalCost) * 100).toFixed(1)) : 0;

  return {
    vehicle_id,
    registration_number: vehicle.registration_number,
    vehicle_name: vehicle.vehicle_name,
    fuel_cost: Number(fuelCost.toFixed(2)),
    maintenance_cost: Number(maintenanceCost.toFixed(2)),
    expense_cost: Number(expenseCost.toFixed(2)),
    total_operational_cost: Number(totalCost.toFixed(2)),
    breakdown: {
      fuel_pct: fuelPct,
      maintenance_pct: maintenancePct,
      expense_pct: expensePct
    }
  };
};

import { validationResult } from "express-validator";
import { refreshCache } from "../src/jobs/queues.js";
import {
  addExpense,
  fetchExpenseById,
  fetchAllExpenses,
  editExpense,
  removeExpense,
  calculateOperationalCost
} from "../src/services/expenseservices.js";

// Create Expense (POST /)
export const createExpense = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const expense = await addExpense(req.body);
    await refreshCache();

    return res.status(201).json({
      message: "Expense created successfully",
      expense
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// List Expenses (GET /)
export const getExpenses = async (req, res) => {
  try {
    const {
      vehicle_id = "",
      category = "",
      page = 1,
      limit = 10
    } = req.query;

    const expenses = await fetchAllExpenses(
      vehicle_id,
      category,
      Number(page),
      Number(limit)
    );

    return res.status(200).json({
      message: "Expenses fetched successfully",
      count: expenses.length,
      expenses
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get single Expense (GET /:id)
export const getExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await fetchExpenseById(id);
    return res.status(200).json({
      message: "Expense fetched successfully",
      expense
    });
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

// Update Expense (PUT /:id)
export const updateExpenseApi = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const expense = await editExpense(id, req.body);
    await refreshCache();

    return res.status(200).json({
      message: "Expense updated successfully",
      expense
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Delete Expense (DELETE /:id)
export const deleteExpenseApi = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await removeExpense(id);
    await refreshCache();

    return res.status(200).json({
      message: "Expense deleted successfully",
      expense
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Get Operational Cost (GET /operational-cost/:vehicleId)
export const getOperationalCost = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const costData = await calculateOperationalCost(vehicleId);
    return res.status(200).json({
      message: "Operational cost calculated successfully",
      costData
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

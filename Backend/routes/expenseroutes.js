import express from "express";
import { createExpenseValidator } from "../src/validators/expensevalidators.js";
import {
  createExpense,
  getExpenses,
  getExpense,
  updateExpenseApi,
  deleteExpenseApi,
  getOperationalCost
} from "../controllers/expensecontroller.js";

const router = express.Router();

router.post("/", createExpenseValidator, createExpense);
router.get("/", getExpenses);
router.get("/operational-cost/:vehicleId", getOperationalCost);
router.get("/:id", getExpense);
router.put("/:id", createExpenseValidator, updateExpenseApi);
router.delete("/:id", deleteExpenseApi);

export default router;

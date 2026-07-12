import { body } from "express-validator";

export const createExpenseValidator = [
  body("vehicle_id")
    .trim()
    .notEmpty()
    .withMessage("Vehicle ID is required")
    .isUUID()
    .withMessage("Vehicle ID must be a valid UUID"),

  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required")
    .isIn(["Toll", "Repair", "Parking", "Miscellaneous"])
    .withMessage("Category must be one of: Toll, Repair, Parking, Miscellaneous"),

  body("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isFloat({ min: 0 })
    .withMessage("Amount must be a non-negative number"),

  body("expense_date")
    .notEmpty()
    .withMessage("Expense date is required")
    .isISO8601()
    .withMessage("Expense date must be a valid ISO8601 date (e.g. YYYY-MM-DD)"),

  body("description")
    .optional()
    .trim()
];

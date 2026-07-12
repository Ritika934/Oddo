import { body } from "express-validator";

export const fuelLogValidator = [
  body("vehicle_id")
    .trim()
    .notEmpty()
    .withMessage("Vehicle ID is required")
    .isUUID()
    .withMessage("Vehicle ID must be a valid UUID"),

  body("fill_date")
    .notEmpty()
    .withMessage("Fill date is required")
    .isISO8601()
    .withMessage("Fill date must be a valid ISO8601 date (e.g. YYYY-MM-DD)"),

  body("liters")
    .notEmpty()
    .withMessage("Liters filled is required")
    .isFloat({ gt: 0 })
    .withMessage("Liters must be a positive number greater than 0"),

  body("cost")
    .notEmpty()
    .withMessage("Fuel cost is required")
    .isFloat({ min: 0 })
    .withMessage("Fuel cost must be a non-negative number"),

  body("odometer")
    .notEmpty()
    .withMessage("Odometer reading is required")
    .isFloat({ min: 0 })
    .withMessage("Odometer reading must be a non-negative number"),
];

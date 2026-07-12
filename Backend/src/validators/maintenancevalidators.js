import { body } from "express-validator";

export const createMaintenanceValidator = [
  body("vehicle_id")
    .trim()
    .notEmpty()
    .withMessage("Vehicle ID is required")
    .isUUID()
    .withMessage("Vehicle ID must be a valid UUID"),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 5 })
    .withMessage("Description must be at least 5 characters long"),
];

export const closeMaintenanceValidator = [
  body("cost")
    .notEmpty()
    .withMessage("Maintenance cost is required")
    .isFloat({ min: 0 })
    .withMessage("Maintenance cost must be a non-negative number"),
];

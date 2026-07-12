import { body } from "express-validator";

export const createTripValidator = [
  body("route")
    .trim()
    .notEmpty()
    .withMessage("Route is required"),

  body("vehicle_id")
    .trim()
    .notEmpty()
    .withMessage("Vehicle ID is required")
    .isUUID()
    .withMessage("Vehicle ID must be a valid UUID"),

  body("driver_id")
    .notEmpty()
    .withMessage("Driver ID is required")
    .isInt({ gt: 0 })
    .withMessage("Driver ID must be a positive integer"),

  body("cargo_weight")
    .notEmpty()
    .withMessage("Cargo weight is required")
    .isFloat({ min: 0 })
    .withMessage("Cargo weight must be a non-negative number"),
];

export const completeTripValidator = [
  body("odometer_end")
    .notEmpty()
    .withMessage("Odometer end reading is required")
    .isFloat({ min: 0 })
    .withMessage("Odometer end reading must be a non-negative number"),
];

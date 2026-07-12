import { body } from "express-validator";

export const createVehicleValidator = [
  body("registration_number")
    .trim()
    .notEmpty()
    .withMessage("Registration number is required"),

  body("vehicle_name")
    .trim()
    .notEmpty()
    .withMessage("Vehicle name is required"),

  body("vehicle_type")
    .trim()
    .notEmpty()
    .withMessage("Vehicle type is required"),

  body("max_load_capacity")
    .isFloat({ gt: 0 })
    .withMessage("Maximum load capacity must be greater than 0"),

  body("acquisition_cost")
    .isFloat({ min: 0 })
    .withMessage("Acquisition cost cannot be negative"),
];
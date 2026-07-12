import { body } from "express-validator";

export const createDriverValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Driver name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Driver name must be between 2 and 100 characters"),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^\+?[0-9\s\-()]{7,20}$/)
    .withMessage("Enter a valid phone number"),

  body("license_number")
    .trim()
    .notEmpty()
    .withMessage("License number is required")
    .matches(/^[A-Z0-9\-]+$/i)
    .withMessage("License number must be alphanumeric (dashes allowed)"),

  body("license_expiry")
    .notEmpty()
    .withMessage("License expiry date is required")
    .isISO8601()
    .withMessage("License expiry must be a valid ISO8601 date (e.g. YYYY-MM-DD)")
    .custom((value) => {
      const expiryDate = new Date(value);
      if (isNaN(expiryDate.getTime())) {
        throw new Error("Invalid expiry date");
      }
      return true;
    }),
];

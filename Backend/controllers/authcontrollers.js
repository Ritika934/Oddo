import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

const validateSignupInput = ({ full_name, email, password }) => {
  if (!full_name || !email || !password) {
    return "All fields are required";
  }
  if (full_name.trim().length < 2) {
    return "Full name must be at least 2 characters";
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    return "Enter a valid email address";
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }
  return null;
};

const validateLoginInput = ({ email, password }) => {
  if (!email || !password) {
    return "Email and password are required";
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    return "Enter a valid email address";
  }
  return null;
};

export const signup = async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    const validationError = validateSignupInput({ full_name, email, password });
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = full_name.trim();

    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [normalizedEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users
      (full_name,email,password)
      VALUES($1,$2,$3)`,
      [trimmedName, normalizedEmail, hashedPassword]
    );

    return res.status(201).json({ message: "Signup Successful" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const validationError = validateLoginInput({ email, password });
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const result = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [normalizedEmail]
    );
    const user = result.rows[0];

    // Fixed: check the user exists BEFORE comparing passwords,
    // otherwise this throws when the email isn't registered.
    if (!user) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Login Successful",
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
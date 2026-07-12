import pool from "../config/Db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendEmail } from "../config/email.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

const VALID_ROLES = ["fleet_manager", "dispatcher", "safety_officer", "finance_analyst"];

const validateSignupInput = ({ full_name, email, password, role }) => {
  if (!full_name || !email || !password || !role) {
    return "All fields are required (including role)";
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
  if (!VALID_ROLES.includes(role)) {
    return "Invalid role specified";
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
    const { full_name, email, password, role } = req.body;

    const validationError = validateSignupInput({ full_name, email, password, role });
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
      (full_name, email, password, role)
      VALUES($1, $2, $3, $4)`,
      [trimmedName, normalizedEmail, hashedPassword, role]
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

    // Fixed: check the user exists BEFORE comparing passwords
    if (!user) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
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
        role: user.role,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({ message: "Enter a valid email address" });
    }

    // Generate 6 digit numeric code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Upsert verification record
    await pool.query(`
      INSERT INTO email_verifications (email, otp, expires_at)
      VALUES ($1, $2, $3)
      ON CONFLICT (email) DO UPDATE
      SET otp = EXCLUDED.otp, expires_at = EXCLUDED.expires_at;
    `, [normalizedEmail, otp, expiresAt]);

    // Send email via nodemailer
    const subject = "TransitOps Verification Code";
    const text = `Your verification code is: ${otp}. It will expire in 10 minutes.`;
    const html = `
      <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
        <h2 style="color: #3f51b5;">TransitOps</h2>
        <p>You requested a verification code to access your TransitOps account.</p>
        <p style="font-size: 24px; font-weight: bold; background-color: #f1f5f9; padding: 12px; border-radius: 6px; display: inline-block; letter-spacing: 2px;">
          ${otp}
        </p>
        <p style="font-size: 13px; color: #64748b; margin-top: 15px;">
          This code is valid for 10 minutes. If you did not request this, you can safely ignore this email.
        </p>
      </div>
    `;

    await sendEmail({ to: normalizedEmail, subject, text, html });

    return res.status(200).json({
      message: "Verification code sent to your email"
    });

  } catch (error) {
    console.error("sendOtp error:", error);
    return res.status(500).json({ message: "Failed to send verification code" });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const resResult = await pool.query(
      "SELECT * FROM email_verifications WHERE email = $1",
      [normalizedEmail]
    );

    const record = resResult.rows[0];
    if (!record) {
      return res.status(400).json({ message: "No verification code requested for this email" });
    }

    if (record.otp !== otp.trim()) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    if (new Date(record.expires_at) < new Date()) {
      return res.status(400).json({ message: "Verification code has expired" });
    }

    // Optional: Clean up code after successful verification
    await pool.query("DELETE FROM email_verifications WHERE email = $1", [normalizedEmail]);

    return res.status(200).json({
      message: "Email verified successfully"
    });

  } catch (error) {
    console.error("verifyOtp error:", error);
    return res.status(500).json({ message: "Failed to verify code" });
  }
};
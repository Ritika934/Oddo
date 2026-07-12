import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const host = process.env.SMTP_HOST || 'smtp.gmail.com';
const port = parseInt(process.env.SMTP_PORT || '587', 10);
const user = process.env.SMTP_USER;
let pass = process.env.SMTP_PASS;

console.log('Original Pass:', pass);
if (pass) {
  pass = pass.replace(/\s+/g, '');
}
console.log('Cleaned Pass:', pass);

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: { user, pass },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('Verification error:', error);
  } else {
    console.log('Server is ready to take our messages');
  }
  process.exit(0);
});

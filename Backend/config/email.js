import nodemailer from 'nodemailer';

let transporter;

// Create SMTP transporter
const createTransporter = async () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || 'smtp.ethereal.email';
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (user && pass) {
    // Real SMTP config provided in env
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
  } else {
    // Development fallback using Ethereal Email
    console.log("No SMTP credentials found in env. Creating Ethereal mock email transporter...");
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log("Ethereal test account created successfully.");
    } catch (error) {
      console.error("Failed to create Ethereal account, falling back to local print only:", error);
      transporter = {
        sendMail: async (options) => {
          console.log("\n====================================");
          console.log(`[LOCAL PRINT ONLY] Sending email to ${options.to}`);
          console.log(`Subject: ${options.subject}`);
          console.log(`Text: ${options.text}`);
          console.log("====================================\n");
          return { messageId: 'local-print-id' };
        }
      };
    }
  }
  return transporter;
};

export const sendEmail = async ({ to, subject, html, text }) => {
  const mailTransporter = await createTransporter();
  const mailOptions = {
    from: process.env.SMTP_FROM || '"TransitOps" <noreply@transitops.com>',
    to,
    subject,
    text,
    html
  };

  const info = await mailTransporter.sendMail(mailOptions);
  
  // If using Ethereal, log the preview URL for testing
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`[Ethereal Preview URL]: ${previewUrl}`);
  }
  return info;
};

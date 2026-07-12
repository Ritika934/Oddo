import nodemailer from 'nodemailer';

let transporter;
let transporterMode = null; // 'smtp' | 'ethereal' | 'local'

// Create SMTP transporter (cached)
const createTransporter = async () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || 'smtp.ethereal.email';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  // Guard against placeholder values left in .env (e.g. "your_gmail_app_password")
  const looksLikePlaceholder = (val) =>
    !val || /your_|yourgmail|example|changeme|placeholder/i.test(val);

  if (user && pass && !looksLikePlaceholder(user) && !looksLikePlaceholder(pass)) {
    console.log(`Setting up SMTP transporter for host=${host} port=${port} user=${user}`);
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for 587/others (STARTTLS)
      auth: { user, pass },
    });
    transporterMode = 'smtp';

    // Verify credentials immediately so failures show up at startup, not on first OTP request
    try {
      await transporter.verify();
      console.log('SMTP transporter verified successfully — ready to send real emails.');
    } catch (err) {
      console.error('SMTP transporter verification FAILED. Emails will not send.');
      console.error('Reason:', err.message);
      if (err.responseCode === 535) {
        console.error(
          'Gmail rejected the credentials (535 Invalid login). ' +
          'Make sure SMTP_USER is the full gmail address, SMTP_PASS is a 16-character ' +
          'Google "App Password" (NOT your normal Gmail password), and that 2-Step ' +
          'Verification is enabled on the account.'
        );
      }
      // Don't throw here — fall through so the app still boots; sendEmail() will
      // surface the real error on the actual send attempt.
    }
  } else {
    // Development fallback using Ethereal Email
    console.log('No valid SMTP credentials found in env. Creating Ethereal mock email transporter...');
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      transporterMode = 'ethereal';
      console.log('Ethereal test account created successfully. Emails will NOT reach real inboxes.');
      console.log('Check the console for an [Ethereal Preview URL] after each send.');
    } catch (error) {
      console.error('Failed to create Ethereal account, falling back to local print only:', error.message);
      transporter = {
        sendMail: async (options) => {
          console.log('\n====================================');
          console.log(`[LOCAL PRINT ONLY] Sending email to ${options.to}`);
          console.log(`Subject: ${options.subject}`);
          console.log(`Text: ${options.text}`);
          console.log('====================================\n');
          return { messageId: 'local-print-id' };
        },
      };
      transporterMode = 'local';
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
    html,
  };

  try {
    const info = await mailTransporter.sendMail(mailOptions);

    // If using Ethereal, log the preview URL for testing
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[Ethereal Preview URL]: ${previewUrl}`);
    } else if (transporterMode === 'smtp') {
      console.log(`Email sent to ${to} via SMTP. messageId=${info.messageId}`);
    }

    return info;
  } catch (err) {
    console.error(`sendEmail failed (mode=${transporterMode}) for recipient ${to}:`, err.message);
    // Re-throw so the calling controller (e.g. sendOtp) can return a proper error response
    throw err;
  }
};
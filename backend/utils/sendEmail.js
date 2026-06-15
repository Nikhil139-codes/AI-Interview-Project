const nodemailer = require('nodemailer');

/**
 * Sends an email using Nodemailer.
 * If SMTP environment variables are missing, logs the email details to the terminal console (useful for local development).
 */
const sendEmail = async (options) => {
  const hasSmtpConfig =
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS;

  if (!hasSmtpConfig) {
    console.log('\n┌────────────────────────────────────────────────────────┐');
    console.log('│                   📬  [MOCK EMAIL SENT]                │');
    console.log('├────────────────────────────────────────────────────────┤');
    console.log(`│ To:      %-45s │`, options.to);
    console.log(`│ Subject: %-45s │`, options.subject);
    console.log('├────────────────────────────────────────────────────────┤');
    console.log('│ Message:                                               │');
    
    // Split message by lines to print cleanly inside console box
    const lines = options.text.split('\n');
    lines.forEach(line => {
      // Print lines within a reasonable width
      console.log(`│   ${line.padEnd(52)} │`);
    });
    
    console.log('└────────────────────────────────────────────────────────┘\n');
    return { mock: true };
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `${process.env.FROM_NAME || 'AI Interview Simulator'} <${process.env.FROM_EMAIL || 'no-reply@ai-interview-platform.com'}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};

module.exports = sendEmail;

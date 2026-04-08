const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = async (email, name, token) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"ResearchHub" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify your ResearchHub account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f1117; color: #ffffff; padding: 40px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #f59e0b; font-size: 28px; margin: 0;">ResearchHub</h1>
          <p style="color: #6b7280; margin-top: 8px;">Student Research Repository</p>
        </div>
        
        <h2 style="color: #ffffff; font-size: 22px;">Hi ${name}, verify your email</h2>
        <p style="color: #9ca3af; line-height: 1.6;">
          Thanks for signing up! Click the button below to verify your email address and activate your account.
        </p>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="${verifyUrl}" 
             style="background: #f59e0b; color: #000000; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px;">
          This link expires in <strong style="color: #f59e0b;">24 hours</strong>.
        </p>
        <p style="color: #6b7280; font-size: 14px;">
          If you didn't create an account, you can safely ignore this email.
        </p>
        
        <hr style="border: 1px solid #1f2937; margin: 32px 0;" />
        <p style="color: #4b5563; font-size: 12px; text-align: center;">
          ResearchHub · Student Research Platform
        </p>
      </div>
    `,
  });
};

module.exports = { sendVerificationEmail };
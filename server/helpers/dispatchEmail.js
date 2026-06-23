import nodemailer from "nodemailer";

export const dispatchEmail = async (userId, userEmail) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const verificationLink = `https://userbase-api.vercel.app/api/auth/verify-email?id=${userId}`;

  const mailOptions = {
    from: `"User Management Admin" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: "Verify Your Account Status",
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #333; text-align: center;">Welcome to the Platform!</h2>
        <p>Thank you for registering. To complete your setup and transition your account to an active status, please click the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
            Verify Account Email
          </a>
        </div>
        <p style="font-size: 12px; color: #777; text-align: center;">
          If the button above does not load, copy and paste this link into your browser:<br>
          <a href="${verificationLink}">${verificationLink}</a>
        </p>
      </div>
    `,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`email successfully delivered to: ${userEmail}`);
  } catch (error) {
    console.error("Mail delivery failure:", error);
  }
};

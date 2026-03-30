import nodemailer from "nodemailer";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
    });
  }

  async compileTemplate(templateName, variables) {
    const templatePath = path.join(__dirname, "..", "templates", `${templateName}.html`);
    let template = await fs.readFile(templatePath, "utf-8");

    Object.keys(variables).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      template = template.replace(regex, variables[key]);
    });

    return template;
  }

  async sendMail({ to, subject, html, text }) {
    try {
      const mailOptions = {
        from: `"ELibJS" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
        text,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", info.messageId);
      return info;
    } catch (error) {
      console.error("Error sending email:", error);
      throw new Error("Failed to send email");
    }
  }

  async sendTemplatedEmail({ to, subject, template, variables }) {
    const htmlContent = await this.compileTemplate(template, variables);
    return this.sendMail({ to, subject, html: htmlContent });
  }

  async sendWelcomeEmail(user) {
    const timeOfDay = new Date().getHours();
    let greeting = "Hello";

    if (timeOfDay < 12) greeting = "Good morning";
    else if (timeOfDay < 18) greeting = "Good afternoon";
    else greeting = "Good evening";

    await this.sendTemplatedEmail({
      to: user.email,
      subject: `Welcome to ELibJS, ${user.firstname}!`,
      template: "welcome",
      variables: {
        username: `${user.firstname} ${user.lastname}`.trim() || user.username,
        greeting,
        loginUrl: `${process.env.FRONTEND_URL}/login`,
        address: process.env.COMPANY_ADDRESS || "Your Trusted Digital Library",
      },
    });
  }

  async sendPasswordResetSuccessEmail(user) {
    await this.sendTemplatedEmail({
      to: user.email,
      subject: "Password Reset Successful - ELibJS",
      template: "passwordResetSuccess",
      variables: {
        username: `${user.firstname} ${user.lastname}`.trim() || user.username,
        loginUrl: `${process.env.FRONTEND_URL}/login`,
        timestamp: new Date().toLocaleString(),
      },
    });
  }

  async sendPasswordResetEmail(email, hashedToken) {
    await this.sendTemplatedEmail({
      to: email,
      subject: "Reset Your Password - ELibJS",
      template: "passwordReset",
      variables: { resetUrl: `${process.env.FRONTEND_URL}/passwd-reset?token=${hashedToken}` },
    });
  }

  async sendVerificationCodeEmail(user, code) {
    await this.sendMail({
      to: user.email,
      subject: "Verify your account",
      text: `Your verification code is ${code}. It expires in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
          <h2>Verify your account</h2>
          <p>Use this code to verify your account:</p>
          <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px;">${code}</p>
          <p>This code expires in 10 minutes.</p>
        </div>
      `,
    });
  }

  async sendTwoFactorCodeEmail(user, code) {
    await this.sendMail({
      to: user.email,
      subject: "Your 2FA sign-in code",
      text: `Your 2FA code is ${code}. It expires in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
          <h2>Two-factor authentication</h2>
          <p>Use this code to finish signing in:</p>
          <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px;">${code}</p>
          <p>This code expires in 10 minutes. If you did not request this, reset your password immediately.</p>
        </div>
      `,
    });
  }

  sendRegistrationEmailsInBackground(user, verificationCode) {
    setImmediate(() => {
      Promise.allSettled([this.sendWelcomeEmail(user), this.sendVerificationCodeEmail(user, verificationCode)]).then((results) => {
        const rejectedResults = results.filter((result) => result.status === "rejected");

        if (rejectedResults.length) {
          console.error("Failed to send one or more registration emails:", rejectedResults);
        }
      });
    });
  }
}

export const emailService = new EmailService();

import nodemailer from "nodemailer";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
    });
  }

  /**
   * Load and compile an email template
   * @param {string} templateName - Name of the template file without extension
   * @param {Object} variables - Variables to replace in the template
   */
  async compileTemplate(templateName, variables) {
    const templatePath = path.join(__dirname, "..", "templates", `${templateName}.html`);
    let template = await fs.readFile(templatePath, "utf-8");

    // Replace all variables in the template
    Object.keys(variables).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      template = template.replace(regex, variables[key]);
    });

    return template;
  }

  /**
   * Send an email using a template
   * @param {Object} options - Email options
   * @param {string} options.to - Recipient email
   * @param {string} options.subject - Email subject
   * @param {string} options.template - Template name
   * @param {Object} options.variables - Template variables
   */
  async sendTemplatedEmail({ to, subject, template, variables }) {
    try {
      const htmlContent = await this.compileTemplate(template, variables);

      const mailOptions = { from: `"ELibJS" <${process.env.EMAIL_USER}>`, to, subject, html: htmlContent };

      const info = await this.transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", info.messageId);
      return info;
    } catch (error) {
      console.error("Error sending email:", error);
      throw new Error("Failed to send email");
    }
  }

  /**
   * Send welcome email with enhanced personalization
   * @param {Object} user - User object
   */
  async sendWelcomeEmail(user) {
    const timeOfDay = new Date().getHours();
    let greeting = "Hello";

    if (timeOfDay < 12) greeting = "Good morning";
    else if (timeOfDay < 18) greeting = "Good afternoon";
    else greeting = "Good evening";

    await this.sendTemplatedEmail({
      to: user.email,
      subject: `Welcome to ELibJS, ${user.fullName}! 🎉`,
      template: "welcome",
      variables: {
        username: user.fullName || user.username,
        greeting,
        loginUrl: `${process.env.FRONTEND_URL}/login`,
        address: process.env.COMPANY_ADDRESS || "Your Trusted Digital Library",
      },
    });
  }

  /**
   * Send password reset success email
   * @param {Object} user - User object
   */
  async sendPasswordResetSuccessEmail(user) {
    await this.sendTemplatedEmail({
      to: user.email,
      subject: "Password Reset Successful - GameDb",
      template: "passwordResetSuccess",
      variables: {
        username: user.fullName || user.username,
        loginUrl: `${process.env.FRONTEND_URL}/login`,
        timestamp: new Date().toLocaleString(),
      },
    });
  }

  /**
   * Send password reset email
   * @param {string} email - Recipient email
   * @param {string} hashedToken - Password reset token
   */
  async sendPasswordResetEmail(email, hashedToken) {
    await this.sendTemplatedEmail({
      to: email,
      subject: "Reset Your Password - ELibJS",
      template: "passwordReset",
      variables: { resetUrl: `${process.env.FRONTEND_URL}/passwd-reset?token=${hashedToken}` },
    });
  }
}

// Create and export a singleton instance
export const emailService = new EmailService();

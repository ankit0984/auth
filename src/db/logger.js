import winston from "winston";
import fs from "fs";
import path from "path";

const transports = [];

// Always add console transport for visibility in build logs and server logs
transports.push(
  new winston.transports.Console({ format: winston.format.simple() })
);

// Add file transports only when explicitly enabled (to avoid write attempts during build)
const enableFileLogs = process.env.ENABLE_FILE_LOGS === "true" || process.env.NODE_ENV === "development";
if (enableFileLogs) {
  try {
    const logsDir = path.resolve(process.cwd(), "logs");
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    transports.push(new winston.transports.File({ filename: path.join("logs", "error.log"), level: "error" }));
    transports.push(new winston.transports.File({ filename: path.join("logs", "combined.log") }));
  } catch (err) {
    // If we cannot write to disk (e.g., during build), fall back to console only
    console.warn("File transports for logger not enabled:", err?.message || err);
  }
}

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports,
});

export default logger;

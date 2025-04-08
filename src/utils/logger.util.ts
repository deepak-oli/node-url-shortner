import winston from "winston";
import path from "path";
import fs from "fs";

// Ensure logs directory exists
const logDir = "logs";
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue",
};

// Add colors to winston
winston.addColors(colors);

// Define format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.json()
);

// Create the logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  levels,
  format: winston.format.json(),
  defaultMeta: { service: "api-service" },
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      format: fileFormat,
    }),
    // Write all logs to combined.log
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
      format: fileFormat,
    }),
    // Console output for development
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],
});

// Helper function to stringify objects for logging
const formatData = (data: any): string => {
  if (!data) return "";
  try {
    return typeof data === "object"
      ? JSON.stringify(data, null, 2)
      : String(data);
  } catch (error) {
    return "[Circular or non-serializable data]";
  }
};

export const Logger = {
  info: (message: string, data?: any): void => {
    logger.info(`${message} ${data ? formatData(data) : ""}`);
  },

  error: (message: string, data?: any): void => {
    logger.error(`${message} ${data ? formatData(data) : ""}`);
  },

  warn: (message: string, data?: any): void => {
    logger.warn(`${message} ${data ? formatData(data) : ""}`);
  },

  debug: (message: string, data?: any): void => {
    logger.debug(`${message} ${data ? formatData(data) : ""}`);
  },

  http: (message: string, data?: any): void => {
    logger.http(`${message} ${data ? formatData(data) : ""}`);
  },
};

export default Logger;

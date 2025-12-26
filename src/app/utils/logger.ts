import { createLogger, format, transports, Logger } from "winston";
import winston from "winston";
import { LogLevel } from "../config/constants";
import { isDevelopment } from "../config/env";

// ---- Winston log levels ----
const levels = {
    [LogLevel.ERROR]: 0,
    [LogLevel.WARN]: 1,
    [LogLevel.INFO]: 2,
    [LogLevel.HTTP]: 3,
    [LogLevel.DEBUG]: 4,
};

// ---- Colors for development console ----
const colors = {
    [LogLevel.ERROR]: "red",
    [LogLevel.WARN]: "yellow",
    [LogLevel.INFO]: "green",
    [LogLevel.HTTP]: "magenta",
    [LogLevel.DEBUG]: "cyan",
};
winston.addColors(colors);

// ---- Dev format ----
const devFormat = format.combine(
    format.colorize({ all: true }),
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.printf(({ timestamp, level, message, stack }) => `${timestamp} [${level}] ${stack || message}`)
);

// ---- Production format ----
const prodFormat = format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
);

// ---- Logger instance ----
const logger: Logger = createLogger({
    levels,
    level: (process.env.LOG_LEVEL as LogLevel) || (isDevelopment ? LogLevel.DEBUG : LogLevel.INFO),
    format: isDevelopment ? devFormat : prodFormat,
    transports: [
        new transports.Console({
            handleExceptions: true,
        }),
    ],
    exitOnError: false,
});

// ---- HTTP stream for Morgan ----
export const stream = {
    write: (message: string) => {
        if (isDevelopment) console.log(message.trim()); // Dev: colored human-readable HTTP logs
        else logger.http(message.trim());       // Prod: structured JSON logs
    },
};

export default logger;

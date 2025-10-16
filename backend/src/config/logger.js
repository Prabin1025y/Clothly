import winston from "winston";

const { combine, timestamp, printf } = winston.format;

// Custom format function
const customFormat = printf(({ level, message, timestamp }) => {
    // Capitalize level
    const levelStr = level.toUpperCase();

    // Add color per level manually
    let coloredLevel;
    switch (level) {
        case "error":
            coloredLevel = `\x1b[31m[${levelStr}]\x1b[0m`; // red
            break;
        case "warn":
            coloredLevel = `\x1b[33m[${levelStr}]\x1b[0m`; // yellow
            break;
        case "info":
            coloredLevel = `\x1b[34m[${levelStr}]\x1b[0m`; // blue
            break;
        case "debug":
            coloredLevel = `\x1b[32m[${levelStr}]\x1b[0m`; // green
            break;
        default:
            coloredLevel = `[${levelStr}]`; // default no color
    }

    return `${coloredLevel} ${timestamp}: ${message}`;
});

const logger = winston.createLogger({
    level: "debug", // log all levels >= debug
    format: combine(
        timestamp({ format: "HH:mm:ss" }),
        customFormat
    ),
    transports: [new winston.transports.Console()],
});

export default logger;
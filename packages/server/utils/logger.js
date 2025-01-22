import winston from "winston";

// Severity levels.
const levels = {
	error: 0,
	warn: 1,
	info: 2,
	http: 3,
	debug: 4,
};

// Method to set severity based on ENV: (development : all log, production :  warn and error)
const level = () => {
	const env = "development";
	const isDevelopment = env === "development";
	return isDevelopment ? "debug" : "warn";
};

// Define different colors for each level.
const colors = {
	error: "red",
	warn: "yellow",
	info: "green",
	http: "magenta",
	debug: "cyan",
};
winston.addColors(colors);

// Customized the log format.
const format = winston.format.combine(
	winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
	winston.format.colorize({ all: true }),
	winston.format.printf((info) => `${info.timestamp} ${info.level} : ${info.message}`),
);

// Transports to print out messages.
const transports = [
	new winston.transports.Console(),
	new winston.transports.File({ filename: "logs/all.log" }),

	// Separating the error log in different file
	new winston.transports.File({
		filename: "logs/error.log",
		level: "error",
	}),
];

// Create the logger instance
const logger = winston.createLogger({
	level: level(),
	levels,
	format,
	transports,
});

export default logger;

/*
?require('winston-daily-rotate-file'); (not install)
!logger with the winston-daily-rotate-file module
const fileRotateTransport = new winston.transports.DailyRotateFile({
	filename: "combined-%DATE%.log",
	datePattern: "YYYY-MM-DD",
	maxFiles: "14d",
});

const logger = winston.createLogger({
	level: process.env.LOG_LEVEL || 'info',
! Adding metadata to your logs
defaultMeta: {
    service: 'admin-service',
},
	format: combine(timestamp(), json()),
	transports: [fileRotateTransport],
});
*/

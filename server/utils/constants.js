import dotenv from "dotenv";

dotenv.config();

export const ENV = process.env.ENV;

// FRONTEND ORIGIN
export const DEVELOPMENT_ORIGIN = process.env.DEVELOPMENT_ORIGIN;
export const PRODUCTION_ORIGIN = process.env.PRODUCTION_ORIGIN;
export const ORIGIN = ENV === "production" ? PRODUCTION_ORIGIN : DEVELOPMENT_ORIGIN;

// BACKEND PORT
export const DEVELOPMENT_PORT = process.env.DEVELOPMENT_PORT;
export const PRODUCTION_PORT = process.env.PRODUCTION_PORT;
export const PORT = ENV === "production" ? PRODUCTION_PORT : DEVELOPMENT_PORT;

export const DATABASE_URL = process.env.DATABASE_URL;

// REDIS DATABASE
export const REDIS_HOST = process.env.REDIS_HOST;
export const REDIS_PORT = parseInt(process.env.REDIS_PORT);

//  Token for user authentication
export const JWT_ACCESS_KEY = process.env.JWT_ACCESS_KEY;
export const JWT_REFRESH_KEY = process.env.JWT_REFRESH_KEY;

// !To avoiding direct use of eval
export const JWT_ACCESS_TOKEN_AGE = new Function(`return ${process.env.JWT_ACCESS_TOKEN_AGE}`)();
export const JWT_REFRESH_TOKEN_AGE = new Function(`return ${process.env.JWT_REFRESH_TOKEN_AGE}`)();

// JWT cookie setting
export const SECURE_COOKIE = process.env.SECURE_COOKIE === "true";
export const SAMESITE_COOKIE = process.env.SAMESITE_COOKIE;
export const HTTPONLY_COOKIE = process.env.HTTPONLY_COOKIE === "true";

export const COOKIE_OPTIONS = {
	secure: SECURE_COOKIE,
	sameSite: SAMESITE_COOKIE,
	httpOnly: HTTPONLY_COOKIE,
};

// Twilio credentials
export const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
export const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
export const TWILIO_MESSAGING_SERVICE_SID = process.env.TWILIO_MESSAGING_SERVICE_SID;

// Sendgrid credentials
export const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
export const SENDGRID_SENDER_EMAIL = process.env.SENDGRID_SENDER_EMAIL;

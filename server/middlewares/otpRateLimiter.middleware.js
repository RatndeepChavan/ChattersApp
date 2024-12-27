import rateLimit from "express-rate-limit";
import { ErrorResponse } from "#src/utils/responses/ErrorResponse";

const MAX_OTP_RETRY = 3;
const OTP_TIME_WINDOW = 30; // in sec

/**
 * @memberof middlewares
 *
 * @constant otpRateLimiter
 *
 * @description
 * - Rate limiter middleware to limit OTP requests to 3 per 30 seconds.
 * - It has Custom handler function to respond with error if request limit is exceeded.
 *
 */
const otpRateLimiter = rateLimit({
	// Set time window for rate limiting
	windowMs: OTP_TIME_WINDOW * 1000,

	// Allow a maximum of 3 requests
	max: MAX_OTP_RETRY,

	// Custom handler function with error respond
	handler: (req, res, next) => {
		return new ErrorResponse(res).send({
			statusCode: 429,
			message: `For security, only ${MAX_OTP_RETRY} requests withing ${OTP_TIME_WINDOW} seconds of each OTP.`,
		});
	},

	// Enable standard `RateLimit-*` headers to provide rate limit information
	standardHeaders: true,

	// Disable legacy `X-RateLimit-*` headers to keep headers concise
	legacyHeaders: false,
});

export default otpRateLimiter;

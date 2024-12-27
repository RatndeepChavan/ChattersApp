import rateLimit from "express-rate-limit";
import { ErrorResponse } from "#src/utils/responses/ErrorResponse";

const MAX_REFRESH_TOKEN_RETRY = 5;
const REFRESH_TOKEN_TIME_WINDOW = 30; // in sec

/**
 * @memberof middlewares
 *
 * @constant otpRateLimiter
 *
 * @description
 * - Rate limiter middleware to limit refresh token requests to 5 per 30 seconds.
 * - It has Custom handler function to respond with error if request limit is exceeded.
 *
 */
const refreshTokenRateLimiter = rateLimit({
	// Set time window for rate limiting
	windowMs: REFRESH_TOKEN_TIME_WINDOW * 1000,

	// Allow a maximum of 5 requests
	max: MAX_REFRESH_TOKEN_RETRY,

	// Custom handler function with error respond
	handler: (req, res, next) => {
		return new ErrorResponse(res).send({
			statusCode: 429,
			message: "SESSION EXPIRED PLEASE LOGIN AGAIN",
		});
	},

	// Enable standard `RateLimit-*` headers to provide rate limit information
	standardHeaders: true,

	// Disable legacy `X-RateLimit-*` headers to keep headers concise
	legacyHeaders: false,
});

export default refreshTokenRateLimiter;

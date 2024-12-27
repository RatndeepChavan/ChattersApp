import * as OTPAuth from "otpauth";
import { createClient } from "redis";
import logger from "#src/utils/logger";
import { REDIS_HOST, REDIS_PORT } from "#src/utils/constants";

/**
 * @namespace utils.OTPHandler
 */

/**
 * @memberof utils.OTPHandler
 *
 * @function getTotpInstance
 *
 * @description
 * Function that returns a TOTP (Time-based One-Time Password) instance.
 *
 * @param {string} secret - cryptographic secret.
 * @param {number} otpLength - Length of generated OTP.
 * @param {number} otpTime - Validity period of OTP in seconds.
 * @returns {OTPAuth.TOTP} TOTP instance.
 */
const getTotpInstance = (secret, otpLength, otpTime) => {
	// Create a new TOTP instance
	const totp = new OTPAuth.TOTP({
		algorithm: "SHA256", // Algorithm used for HMAC function
		digits: otpLength, // Length of the OTP
		period: otpTime, // Validity period in seconds
		secret: secret, // Cryptographic secret
	});
	return totp;
};

/**
 * @memberof utils.OTPHandler
 *
 * @function getRedisClient
 *
 * @description
 * Function to create Redis client instance connected to redis database.
 *
 * @returns {Promise<RedisClient>} Connected Redis client instance.
 */
const getRedisClient = async () => {
	// Create and connect to Redis client
	const redisClient = await createClient({
		legacyMode: true,
		socket: {
			host: REDIS_HOST,
			port: REDIS_PORT,
		},
	})
		.on("error", (error) => {
			logger.error(error);
		})
		.connect();

	return redisClient;
};

/**
 * @memberof utils.OTPHandler
 *
 * @function OTPGenerator
 *
 * @description
 * Generates a TOTP (Time-based One-Time Password) and stores the associated secret in Redis.
 *
 * @param {object} object - object having entries with userId, otpLength, otpTime as keys.
 * @param {string} object.userId - Unique user identifier for retrieving OTP secret.
 * @param {number} [object.otpLength=6] - Length of the generated OTP.
 * @param {number} [object.otpTime=30] - Validity period of the OTP in seconds.
 * @returns {string} The generated OTP.
 * @throws {Error} Throws error if userId is not provided.
 */
export const OTPGenerator = async ({ userId = undefined, otpLength = 6, otpTime = 30 } = {}) => {
	// Ensure userId is provided
	if (!userId) {
		throw Error("Please provide userId to generate OTP");
	}
	const stringId = String(userId);

	// Cryptographically secure random secret key
	const secret = new OTPAuth.Secret({ size: 20 }).base32;

	// Create TOTP instance using the secret
	const totp = getTotpInstance(secret, otpLength, otpTime);

	// Store secret in Redis with an expiration time equal to the OTP period
	const redisClient = await getRedisClient();
	await redisClient.set(stringId, secret, "EX", otpTime);

	// Generate and return the OTP
	const otp = totp.generate();
	return otp;
};

/**
 * @memberof utils.OTPHandler
 *
 * @function OTPValidator
 *
 * @description
 * Validates the provided OTP against the stored TOTP secret for the user.
 *
 * @param {object} object - object having entries with otp, userId, otpLength, otpTime as keys.
 * @param {string} object.otp - The OTP to validate.
 * @param {string} object.userId - Unique user identifier for retrieving OTP secret.
 * @param {number} [object.otpLength=6] - Length of the generated OTP.
 * @param {number} [object.otpTime=30] - Validity period of the OTP in seconds.
 * @returns {Promise<boolean|undefined>} `true` if the OTP is valid, otherwise `undefined`.
 * @throws {Error} Throws error if userId or otp is not provided.
 */
export const OTPValidator = async ({
	otp = undefined,
	userId = undefined,
	otpLength = 6,
	otpTime = 30,
} = {}) => {
	// Ensure userId is provided
	if (!userId) {
		throw Error("Please provide userId to validate OTP");
	}

	// Ensure otp is provided
	if (!otp) {
		throw Error("Please provide otp to validate OTP");
	}

	// Retrieve Redis client and fetch stored secret using userId
	const redisClient = await getRedisClient();
	const secret = await redisClient.get(userId);

	// If no secret is found for the user, return undefined (validation fails)
	if (!secret) {
		return;
	}

	// Creating TOTP instance
	const totp = getTotpInstance(secret, otpLength, otpTime);

	try {
		// Validating the OTP
		return totp.validate({ token: otp });
	} catch (error) {
		logger.error(error);
		return;
	}
};

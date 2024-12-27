import jwt from "jsonwebtoken";
import { ErrorResponse } from "#src/utils/responses/ErrorResponse";
import logger from "#src/utils/logger";
import { JWT_ACCESS_KEY } from "#src/utils/constants";

/**
 * @memberof middlewares
 *
 * @function verifyToken
 *
 * @description
 * - Middleware to verify JSON Web Token (JWT) and authorize requests.
 * - If the token is valid, the user's ID is attached to the request object as `req.userId`.
 * - For invalid token, the function logs a warning for malicious requests.
 *
 * @param {Request} req request sent from client
 * @param {Response} res response generated from server
 * @param {function} next - Express next middleware function.
 * @returns {Response | void} Sends an error response or proceeds to the next middleware if valid.
 * <b>HTTP response codes</b>
 * - 401 : `TokenExpiredError.`
 * - 403 : `Invalid token. Access forbidden.`
 * - 403 : `Token not active. Please try later.`
 * - 500 : `INTERNAL SERVER ERROR`
 */
export const verifyToken = async (req, res, next) => {
	try {
		// Extracting access token from cookies
		const access_token = req?.cookies?.access_token;

		// Checking if access token is missing
		if (!access_token) {
			return new ErrorResponse(res).send({
				statusCode: 401,
				message: "TokenExpiredError",
			});
		}

		// Verifying the token
		const decoded = jwt.verify(access_token, JWT_ACCESS_KEY);

		// Adding userId to request instance
		req.userId = decoded.userId;
		next();
	} catch (error) {
		switch (error.name) {
			// Token has expired
			case "TokenExpiredError":
				return new ErrorResponse(res).send({
					statusCode: 401,
					message: "TokenExpiredError",
				});
			// Token is invalid
			case "JsonWebTokenError":
				logger.warn(
					`Malicious request detected: { error: ${error.name}, message: ${error.message} }`,
				);
				return new ErrorResponse(res).send({
					statusCode: 403,
					message: "Invalid token. Access forbidden.",
				});
			// Token is not yet active
			case "NotBeforeError":
				return new ErrorResponse(res).send({
					statusCode: 403,
					message: "Token not active. Please try later.",
				});
			// Unexpected error
			default:
				logger.error(error);
				return new ErrorResponse(res).send();
		}
	}
};

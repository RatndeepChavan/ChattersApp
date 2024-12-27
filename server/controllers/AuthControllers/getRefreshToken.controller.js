import jwt from "jsonwebtoken";
import {
	COOKIE_OPTIONS,
	JWT_ACCESS_TOKEN_AGE,
	JWT_REFRESH_KEY,
	JWT_REFRESH_TOKEN_AGE,
} from "#src/utils/constants";
import logger from "#src/utils/logger";
import { jwtTokenGenerator } from "#src/helpers/jwtTokenGenerator";
import { ErrorResponse } from "#src/utils/responses/ErrorResponse";
import { SuccessResponse } from "#src/utils/responses/SuccessResponse";

/**
 * @memberof controllers.AuthControllers
 *
 * @function getRefreshToken
 *
 * @description
 * - Endpoint handler to refresh JWT tokens. Verifies the provided refresh token.
 * - For valid refresh token, it generates a new access token and refresh token, and sets them as cookies.
 *
 *
 * @param {Request} req request sent from client
 * @param {string} req.cookies jwt cookie from client's storage
 * @param {Response} res response generated from server
 * @returns {Response}
 */
export const getRefreshToken = async (req, res) => {
	try {
		// Extracting jwt token from request
		const { refresh_token: token } = req?.cookies;
		if (!token) {
			return new ErrorResponse(res).send({
				statusCode: 403,
				message: "Session expired, please log in again",
			});
		}

		// Verifying the token
		const validRefreshToken = jwt.verify(token, JWT_REFRESH_KEY);
		if (!validRefreshToken) {
			return new ErrorResponse(res).send({
				statusCode: 401,
				message: "Invalid token",
			});
		}

		// Decoding received token for userId
		const { userId } = validRefreshToken;

		// Generating jwt cookie from user's details
		const { access_token, refresh_token } = jwtTokenGenerator(userId);

		// Setting up the cookie in client's storage
		res.cookie("access_token", access_token, {
			...COOKIE_OPTIONS,
			maxAge: JWT_ACCESS_TOKEN_AGE,
		});
		res.cookie("refresh_token", refresh_token, {
			...COOKIE_OPTIONS,
			maxAge: JWT_REFRESH_TOKEN_AGE,
		});

		return new SuccessResponse(res).send();
	} catch (error) {
		logger.error(error);
		return new ErrorResponse(res).send();
	}
};

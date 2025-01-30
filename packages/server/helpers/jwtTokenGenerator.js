import jwt from "jsonwebtoken";
import {
	JWT_ACCESS_KEY,
	JWT_ACCESS_TOKEN_AGE,
	JWT_REFRESH_KEY,
	JWT_REFRESH_TOKEN_AGE,
} from "#src/utils/constants";

/**
 * @memberof helpers
 *
 * @function jwtTokenGenerator
 *
 * @description
 * Function to generates an access and refresh JWT token for a user using user's userId.
 *
 * @param {string} userId - The unique identifier of the user.
 * @returns {Object} An object containing `access_token` and `refresh_token`.
 */
export const jwtTokenGenerator = (userId) => {
	const access_token = jwt.sign({ userId }, JWT_ACCESS_KEY, { expiresIn: JWT_ACCESS_TOKEN_AGE });
	const refresh_token = jwt.sign({ userId }, JWT_REFRESH_KEY, {
		expiresIn: JWT_REFRESH_TOKEN_AGE,
	});
	return { access_token, refresh_token };
};

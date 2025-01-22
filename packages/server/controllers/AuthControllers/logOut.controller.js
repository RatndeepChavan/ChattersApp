import { SuccessResponse } from "#src/utils/responses/SuccessResponse";
import { ErrorResponse } from "#src/utils/responses/ErrorResponse";
import logger from "#src/utils/logger";
import { COOKIE_OPTIONS } from "#src/utils/constants";

/**
 * @memberof controllers.AuthControllers
 *
 * @function logOut
 *
 * @description
 * * <b>`GET REQUEST`</b>
 * - Controller function to handle user logout request.
 * - simple request as if token verified it delete the token with 200 response else return 500.
 *
 * @param {Request} req request sent from client
 * @param {Response} res response generated from server
 *
 * @returns {Response}
 *
 * <b>HTTP response codes</b>
 * - 500 : `INTERNAL SERVER ERROR`
 * - 200 : `Successfully logout`
 */

export const logOut = async (req, res) => {
	try {
		// Clear the stored cookies
		res.clearCookie("access_token", COOKIE_OPTIONS);
		res.clearCookie("refresh_token", COOKIE_OPTIONS);

		// Successful response
		return new SuccessResponse(res).send({ message: "Successfully logout" });
	} catch (error) {
		// Logging the error details
		logger.error(error);
		return new ErrorResponse(res).send();
	}
};

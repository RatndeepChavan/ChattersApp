import User from "#src/models/UserModel";
import logger from "#src/utils/logger";
import { ErrorResponse } from "#src/utils/responses/ErrorResponse";
import { SuccessResponse } from "#src/utils/responses/SuccessResponse";
import { userObjectFilter } from "#src/helpers/userObjectFilter";

/**
 * @memberof controllers.UserControllers
 *
 * @function getUserInfo
 *
 * @description
 * * <b>`GET REQUEST`</b>
 * - Fetches user information based on the ID set by the middleware.
 * - Excludes sensitive fields such as password and timestamps from the response.
 *
 * @param {Request} req request sent from client with `userId` populated by middleware.
 * @param {Response} res response generated from server
 *
 * @returns {Response}
 * <b>HTTP response codes</b>
 * - 404 : `User not found`
 * - 500 : `Internal server error`
 * - 200 : `Ok`
 */
export const getUserInfo = async (req, res) => {
	try {
		// Fetching the user data from database using id set by middleware
		const user = await User.findById(req.userId)
			.select(["-password", "-updatedAt", "-createdAt"])
			.lean();

		// Check if the user exist
		if (!user) {
			return new ErrorResponse(res).send({ statusCode: 404, message: "User not found" });
		}

		// filtering the user's data to avoid sending sensitive info
		const data = userObjectFilter(user);

		// Successful response to return the user's data
		return new SuccessResponse(res).send({ data });
	} catch (error) {
		logger.error(error);
		return new ErrorResponse(res).send();
	}
};

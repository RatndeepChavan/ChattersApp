import User from "#src/models/UserModel";
import logger from "#src/utils/logger";
import { ErrorResponse } from "#src/utils/responses/ErrorResponse";
import { SuccessResponse } from "#src/utils/responses/SuccessResponse";
import { userObjectFilter } from "#src/helpers/userObjectFilter";

/**
 * @memberof controllers.UserControllers
 *
 * @function updateUser
 *
 * @description
 * * <b>`POST REQUEST`</b>
 * - Updates the user's profile information based on provided input data.
 *
 * @param {Request} req request sent from client with `userId` populated by middleware.
 * @param {Response} res response generated from server
 *
 * @returns {Object} JSON response with success or error message.
 * <b>HTTP response codes</b>
 * - 400 : `Please provide username`
 * - 500 : `Internal server error`
 * - 200 : `Ok`
 */
export const updateUser = async (req, res) => {
	try {
		const { userId } = req;
		const { username, status, image } = req.body;

		// Returning the error if username is not provided
		if (!username)
			return new ErrorResponse(res).send({
				statusCode: 400,
				message: "Please provide username",
			});

		// Query to update user's data
		const user = await User.findByIdAndUpdate(
			userId,
			{ username, status, image, profileSetup: true },
			{ new: true, runValidators: true },
		).lean();

		// filtering the user's data to avoid sending sensitive info
		const data = userObjectFilter(user);

		// Successful response to return updated data
		return new SuccessResponse(res).send({
			data,
			message: "Profile updated",
		});
	} catch (error) {
		// Logging the error details
		logger.error(error);
		return new ErrorResponse(res).send();
	}
};

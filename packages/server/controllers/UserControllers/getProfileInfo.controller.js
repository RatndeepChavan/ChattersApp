import mongoose from "mongoose";
import User from "#src/models/UserModel";
import logger from "#src/utils/logger";
import { ErrorResponse } from "#src/utils/responses/ErrorResponse";
import { SuccessResponse } from "#src/utils/responses/SuccessResponse";

/**
 * @memberof controllers.UserControllers
 *
 * @function getProfileInfo
 *
 * @description
 * * <b>`POST REQUEST`</b>
 * - Retrieves the profile information of a user based on the provided profile ID.
 * - Limits the returned fields to `username`, `status`, and `image`.
 *
 * @param {Request} req request sent from client with `userId` populated by middleware.
 * @param {Response} res response generated from server
 *
 * @returns {Response} JSON response with success or error message.
 * <b>HTTP response codes</b>
 * - 400 : `Please provide profileId`
 * - 404 : `User not found`
 * - 500 : `Internal server error`
 * - 200 : `Ok`
 */
export const getProfileInfo = async (req, res) => {
	try {
		const { profileId } = req.body;

		if (!profileId) {
			return new ErrorResponse(res).send({
				statusCode: 400,
				message: "Please provide profileId",
			});
		}

		// Converting the id from string to mongoose id
		// ? aggregate pipeline do not support direct use of string id
		// ? Using find with select more effective but for future aspect here this query is used
		const id = new mongoose.Types.ObjectId(`${profileId}`);

		const userData = await User.aggregate([
			{
				$match: {
					_id: id,
				},
			},
			{
				$project: {
					username: 1,
					status: 1,
					image: 1,
				},
			},
		]);

		// ? Aggregate returns the array
		const data = userData[0];

		if (!data) {
			return new ErrorResponse(res).send({ statusCode: 404, message: "User not found" });
		}

		return new SuccessResponse(res).send({ data });
	} catch (error) {
		logger.error(error);
		return new ErrorResponse(res).send();
	}
};

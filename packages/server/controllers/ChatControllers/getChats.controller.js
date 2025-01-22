import mongoose from "mongoose";
import User from "#src/models/UserModel";
import logger from "#src/utils/logger";
import { SuccessResponse } from "#src/utils/responses/SuccessResponse";
import { ErrorResponse } from "#src/utils/responses/ErrorResponse";

/**
 * @memberof controllers.ChatControllers
 *
 * @function getChats
 *
 * @description
 * * <b>`GET REQUEST`</b>
 * - Return the list of ongoing user's conversations with require data.
 * - Well first it fetch users data and then filter the users based on conversation status.
 * - Then for filtered users it checks unread messages for each conversation.
 *
 * @param {Request} req request sent from client with `userId` populated by middleware.
 * @param {Response} res response generated from server
 *
 * @returns {Response} JSON response with success or error message.
 *  * <b>HTTP response codes</b>
 * - 500 : `Internal server error`
 * - 200 : `Request is in process waiting for response`
 */

export const getChats = async (req, res) => {
	try {
		// Convert userId string to mongoDB ObjectId
		const currentUserId = new mongoose.Types.ObjectId(`${req.userId}`);

		const data = await User.aggregate([
			{
				// Exclude current user
				$match: {
					_id: { $ne: currentUserId },
				},
			},
			{
				// Lookup to get conversation data as conversations
				$lookup: {
					from: "conversations",
					let: { userId: "$_id" },
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										// Current user can be initiator or target
										{ $in: [currentUserId, ["$initiator", "$target"]] },
										{ $in: ["$$userId", ["$initiator", "$target"]] },
									],
								},
							},
						},
					],
					as: "conversations",
				},
			},
			{
				// Filter result to only accepted conversations
				$match: {
					"conversations.status": "ACCEPTED",
				},
			},
			{
				// Lookup to get unread messages for each conversation
				$lookup: {
					from: "messages",
					let: {
						conversationId: { $arrayElemAt: ["$conversations._id", 0] },
					},
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{ $eq: ["$conversationId", "$$conversationId"] },
										{ $eq: ["$receiverId", currentUserId] },
										{ $eq: ["$isRead", false] },
									],
								},
							},
						},
					],
					as: "unreadMessages",
				},
			},
			{
				$project: {
					username: 1,
					status: 1,
					image: 1,
					unreadMessageCount: { $size: "$unreadMessages" },
					conversationId: { $arrayElemAt: ["$conversations._id", 0] },
				},
			},
		]);

		// Success response
		return new SuccessResponse(res).send({ data });
	} catch (error) {
		// Logging the error details
		logger.error(error);
		return new ErrorResponse(res).send();
	}
};

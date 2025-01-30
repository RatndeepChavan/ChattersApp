import Notification from "#src/models/NotificationModel";
import User from "#src/models/UserModel";
import logger from "#src/utils/logger";
import { ErrorResponse } from "#src/utils/responses/ErrorResponse";
import { SuccessResponse } from "#src/utils/responses/SuccessResponse";
import mongoose from "mongoose";

/**
 * @memberof controllers.ChatControllers
 *
 * @function feedbackHandler
 *
 * @description
 * * <b>`GET REQUEST`</b>
 * - Handles fetching chat notifications for the authenticated user.
 * - Aggregates data from the Notification, User, and Conversation collections.
 * - Updates the `newNotification` field for the user to false once notifications are fetched.
 *
 * @param {Request} req request sent from client with `userId` populated by middleware.
 * @param {Response} res response generated from server
 *
 * @returns {Response} JSON response with success or error message.
 *  <b>HTTP response codes</b>
 * - 500 : `Internal server error`
 * - 200 : `Ok`
 */
export const chatNotifications = async (req, res) => {
	// MongoDB session for transactional operation
	const session = await mongoose.startSession();
	await session.startTransaction();

	try {
		// Convert userId to MongoDB ObjectId (aggregate query requires mongoDB ObjectId)
		const id = new mongoose.Types.ObjectId(`${req.userId}`);

		// Aggregate query to fetch notification data.
		const data = await Notification.aggregate([
			{
				// Match notifications where user is receiver.
				$match: {
					receiverId: id,
				},
			},
			{
				// Lookup sender details from User collection.
				$lookup: {
					from: "users",
					localField: "senderId",
					foreignField: "_id",
					as: "senderData",
				},
			},
			{
				// Lookup conversation details from Conversation collection.
				$lookup: {
					from: "conversations",
					localField: "conversationId",
					foreignField: "_id",
					as: "conversationData",
				},
			},
			{
				// Project required fields.
				$project: {
					message: 1,
					senderId: { $arrayElemAt: ["$senderData._id", 0] },
					senderUsername: { $arrayElemAt: ["$senderData.username", 0] },
					senderImage: { $arrayElemAt: ["$senderData.image", 0] },
					conversationStatus: { $arrayElemAt: ["$conversationData.status", 0] },
				},
			},
		]).session(session);

		// Update `newNotification` flag for the user to indicate notifications have been read.
		await User.findByIdAndUpdate(req.userId, { newNotification: false }).session(session);

		// Commit the transaction
		await session.commitTransaction();

		// Success response.
		return new SuccessResponse(res).send({ data });
	} catch (error) {
		// Abort transaction to rollback changes
		await session.abortTransaction();

		// Log the error and return error response
		logger.error(error);
		return new ErrorResponse(res).send();
	} finally {
		// End the MongoDB session
		session.endSession();
	}
};

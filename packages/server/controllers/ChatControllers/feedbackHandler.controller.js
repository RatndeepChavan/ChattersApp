import Conversation from "#src/models/ConversationModel";
import Notification from "#src/models/NotificationModel";
import User from "#src/models/UserModel";
import logger from "#src/utils/logger";
import mongoose from "mongoose";
import { ErrorResponse } from "#src/utils/responses/ErrorResponse";
import { SuccessResponse } from "#src/utils/responses/SuccessResponse";
import socketManager from "#src/socket";

// Constants for feedback status and corresponding messages
const FEEDBACK_STATUS = {
	Accept: "ACCEPTED",
	Reject: "REJECTED",
	Block: "BLOCKED",
};
const FEEDBACK_MESSAGE = {
	Accept: "Accepted your chat request.",
	Reject: "Rejected your chat request.",
	Block: "Blocked your chat request.",
};

/**
 * @memberof controllers.ChatControllers
 *
 * @function feedbackHandler
 *
 * @description
 * * <b>`POST REQUEST`</b>
 * - Handles user feedback on a chat request.
 * - Updates the conversation according to feedback.
 * - Also updates notification and user's notification flag.
 * - Emit socket event to notify user in real time updates.
 *
 * @param {Request} req request sent from client with `userId` populated by middleware.
 * @param {Response} res response generated from server
 *
 * @returns {Response} JSON response with success or error message.
 *  * <b>HTTP response codes</b>
 * - 422 : `Invalid data received.`
 * - 422 : `Invalid feedback received.`
 * - 500 : `Internal server error`
 * - 200 : `Request is in process waiting for response`
 */
export const feedbackHandler = async (req, res) => {
	// MongoDB session for transactional operation
	const session = await mongoose.startSession();
	await session.startTransaction();

	try {
		// Extract feedback data from request body
		const { feedback, notificationId } = req.body;

		// Validate required fields
		if (!feedback || !notificationId) {
			return new ErrorResponse(res).send({
				statusCode: 422,
				message: "Invalid data received.",
			});
		}

		// Map feedback to its status and message
		const status = FEEDBACK_STATUS[feedback];
		const message = FEEDBACK_MESSAGE[feedback];

		// Validate feedback type
		if (!status || !message) {
			return new ErrorResponse(res).send({
				statusCode: 422,
				message: "Invalid feedback received.",
			});
		}

		// Retrieve notification details
		const { receiverId, senderId, conversationId } = await Notification.findById(
			notificationId,
		);

		// Update the notification
		await Notification.findByIdAndUpdate(notificationId, {
			$set: {
				senderId: receiverId,
				receiverId: senderId,
				message,
			},
		}).session(session);

		// Set `newNotification` flag for the sender
		await User.findByIdAndUpdate(senderId, {
			newNotification: true,
		}).session(session);

		// Handle feedback-specific updates
		switch (feedback) {
			case "Accept":
				await Conversation.findByIdAndUpdate(conversationId, {
					status,
				}).session(session);
				break;

			case "Block":
				await Conversation.findByIdAndUpdate(conversationId, {
					status,
					attempts: 10,
				}).session(session);
				break;

			case "Reject":
				await Conversation.updateOne({ _id: conversationId }, [
					{
						$set: {
							status: {
								$cond: {
									if: { $gte: ["$attempts", 5] },
									then: "BLOCKED",
									else: "REJECTED",
								},
							},
						},
					},
				]).session(session);
				break;
		}

		// Commit transaction
		await session.commitTransaction();

		// Emit socket event to notify user in real time
		socketManager.emitEvent(senderId.toString(), "newNotification", { feedback });

		// Success response
		return new SuccessResponse(res).send();
	} catch (error) {
		// Abort transaction and log the error if any error occur and return error response
		await session.abortTransaction();
		logger.error(error);
		return new ErrorResponse(res).send();
	} finally {
		// End MongoDB session
		session.endSession();
	}
};

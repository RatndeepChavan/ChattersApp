import Conversation from "#src/models/ConversationModel";
import { ErrorResponse } from "#src/utils/responses/ErrorResponse";
import { SuccessResponse } from "#src/utils/responses/SuccessResponse";
import { chatInitiationQueue } from "#src/workers/notificationWorkers/initiateChat.worker";
import logger from "#src/utils/logger";
import socketManager from "#src/socket";

// Maximum number of attempts allowed for initiating a chat request
const MAX_ATTEMPTS = 5;

/**
 * @memberof controllers.ChatControllers
 *
 * @function initiateChat
 *
 * @description
 * * <b>`POST REQUEST`</b>
 * - Handles the initiation of a chat request between two users.
 * - It checks for existing conversations and their statuses.
 * - Also checks how many times user try to initiate this conversation  using attempts.
 * - Uses Worker to immediate response and worker handles the actual logic to initiate tasks.
 *
 * @param {Request} req request sent from client with `userId` populated by middleware.
 * @param {Response} res response generated from server
 *
 * @returns {Response} JSON response with success or error message.
 * <b>HTTP response codes</b>
 * - 422 : `Invalid data received.`
 * - 400 : `Already sent a request.`
 * - 400 : `You are friend with this user.`
 * - 400 : `Can't send request, user blocked your profile.`
 * - 400 : `Already requested ${MAX_ATTEMPTS} times. Can't request again.`
 * - 500 : `Internal server error`
 * - 200 : `Request is in process waiting for response`
 */
export const initiateChat = async (req, res) => {
	try {
		// Extracting sender and receiver IDs
		const senderId = req.userId;
		const { id: receiverId } = req.body;

		// Basic validation
		if (!senderId || !receiverId) {
			return new ErrorResponse(res).send({
				statusCode: 422,
				message: "Invalid data received.",
			});
		}

		// Check if a conversation already exists
		const conversationData = await Conversation.findOne({
			$or: [
				{ initiator: senderId, target: receiverId },
				{ initiator: receiverId, target: senderId },
			],
		});

		// If a conversation exists, then check status and attempts
		if (conversationData) {
			const { status } = conversationData;

			// Handling different states of conversation
			switch (status) {
				case "PENDING":
					return new ErrorResponse(res).send({
						statusCode: 400,
						message: "Already sent a request.",
					});
				case "ACCEPTED":
					return new ErrorResponse(res).send({
						statusCode: 400,
						message: "You are friend with this user.",
					});
				case "BLOCKED":
					return new ErrorResponse(res).send({
						statusCode: 400,
						message: "Can't send request, user blocked your profile.",
					});
			}

			// IF max attempts exceed then block user from making further requests
			if (conversationData.attempts >= MAX_ATTEMPTS) {
				return new ErrorResponse(res).send({
					statusCode: 400,
					message: `Already requested ${MAX_ATTEMPTS} times. Can't request again.`,
				});
			}
		}

		// Extracting conversationId to proceed with job
		const conversationId = conversationData ? conversationData["_id"] : null;

		// Add request to the worker queue for further processing
		chatInitiationQueue.add({ senderId, receiverId, conversationId }, { priority: 2 });

		// Emit socket event to notify user in real time
		// ! code needs to move to worker
		socketManager.emitEvent(receiverId, "newNotification");

		// Success response
		return new SuccessResponse(res).send({
			statusCode: 200,
			message: "Request is in process waiting for response",
		});
	} catch (error) {
		// Logging the error details
		logger.error(error);
		return new ErrorResponse(res).send();
	}
};

// !###########################################################
/*
		let conversationId;
		if (conversationData) {
			conversationId = conversationData["_id"];
		}

		const session = await Conversation.startSession();
		session.startTransaction();

		try {
			if (conversationId) {
				await Conversation.findByIdAndUpdate(conversationId, {
					$inc: { attempts: 1 },
					status: "PENDING",
				}).session(session);
			} else {
				const newConversation = await Conversation.create(
					[
						{
							initiator: senderId,
							target: receiverId,
						},
					],
					{ session },
				);

				conversationId = newConversation["_id"];
			}

			await Notification.create([{ senderId, receiverId, conversationId }], { session });

			await User.findOneAndUpdate(
				{
					_id: receiverId,
				},
				{ newNotification: true },
			).session(session);

			await session.commitTransaction();
		} catch (error) {
			logger.error(error);
			await session.abortTransaction();
		} finally {
			session.endSession();
		}

		return new SuccessResponse(res).send({
			statusCode: 200,
			message: "Request is in process waiting for response",
		});
		*/
// !###########################################################

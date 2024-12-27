import Message from "#src/models/MessageModel";
import socketManager from "#src/socket";
import logger from "#src/utils/logger";
import { ErrorResponse } from "#src/utils/responses/ErrorResponse";
import { SuccessResponse } from "#src/utils/responses/SuccessResponse";

/**
 * @memberof controllers.MessageControllers
 *
 * @function updateConversation
 *
 * @description
 * * <b>`POST REQUEST`</b>
 * Updates a conversation by saving a new message and notify receiver via socket event for real time messaging.
 *
 * @param {Object} req - request sent from client with `userId` populated by middleware.
 * @param {Object} req.body - Request body containing message details.
 * @param {string} req.body.receiverId - ID of the message receiver.
 * @param {string} req.body.conversationId - ID of the conversation.
 * @param {string} req.body.message - Content of the message.
 * @param {Response} res response generated from server
 *
 * @returns {Response} JSON response with success or error message.
 * <b>HTTP response codes</b>
 * - 422 : `Invalid data received.`
 * - 500 : `Internal server error`
 * - 200 : `Ok`
 */
export const updateConversation = async (req, res) => {
	try {
		// Extract required parameters from request body
		const senderId = req.userId;
		const { receiverId, conversationId, message } = req.body;

		// Basic validation
		if (!senderId || !receiverId || !conversationId || !message) {
			return new ErrorResponse(res).send({
				statusCode: 422,
				message: "Invalid data received.",
			});
		}

		// Save message
		const data = await Message.create({ senderId, receiverId, conversationId, message });

		// Emit socket event for real time messaging
		socketManager.emitEvent(receiverId, "chatMessage", { data });

		// Success response
		return new SuccessResponse(res).send({ data });
	} catch (error) {
		// log the error and return error response
		logger.error(error);
		return new ErrorResponse(res).send();
	}
};

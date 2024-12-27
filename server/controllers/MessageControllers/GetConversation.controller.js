import Message from "#src/models/MessageModel";
import logger from "#src/utils/logger";
import { SuccessResponse } from "#src/utils/responses/SuccessResponse";
import { ErrorResponse } from "#src/utils/responses/ErrorResponse";

/**
 * @memberof controllers.MessageControllers
 *
 * @function getConversation
 *
 * @description
 * * <b>`GET REQUEST`</b>
 * Get conversation messages based on the conversation ID and optional last message ID.
 *
 * @function controllers.MessageControllers
 *
 * @param {Object} req - Express request object.
 * @param {Object} req.body - Body of the request.
 * @param {string} req.body.conversationId - The ID of the conversation to fetch messages for.
 * @param {string} [req.body.lastMessageId] - Optional. The ID of the last message to fetch messages before this ID.
 * @param {number} [req.body.limit=10] - Optional. The number of messages to fetch. Defaults to 10.
 * @param {Object} res - response generated from server.
 *
 * @returns {Response} JSON response with success or error message.
 *  <b>HTTP response codes</b>
 * - 500 : `Internal server error`
 * - 200 : `Ok`
 */
export const getConversation = async (req, res) => {
	try {
		// Extract require details from request body
		const { conversationId, lastMessageId, limit = 10 } = req.body;

		// Query object to fetch messages
		const query = { conversationId };
		if (lastMessageId) {
			query["_id"] = { $lt: lastMessageId };
		}

		// Fetch messages, sorting by ID and limit the result
		const data = await Message.find(query)
			.sort({ _id: -1 })
			.limit(limit)
			.select(["senderId", "message"]);

		// Success response
		return new SuccessResponse(res).send({ data });
	} catch (error) {
		// Log the error and return error response
		logger.error(error);
		return new ErrorResponse(res).send();
	}
};

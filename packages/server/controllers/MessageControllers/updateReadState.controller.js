import Message from "#src/models/MessageModel";
import logger from "#src/utils/logger";
import { SuccessResponse } from "#src/utils/responses/SuccessResponse";
import { ErrorResponse } from "#src/utils/responses/ErrorResponse";

/**
 * @memberof controllers.MessageControllers
 *
 * @function updateReadState
 *
 * @description
 * * <b>`POST REQUEST`</b>
 * Updates read state all received message for user when user open that chat.
 *
 * @param {Request} req - request sent from client with `userId` populated by middleware.
 * @param {Response} res response generated from server
 *
 * @returns {Response} JSON response with success or error message.
 * <b>HTTP response codes</b>
 * - 500 : `Internal server error`
 * - 200 : `Ok`
 */
export const updateReadState = async (req, res) => {
	try {
		// Extract require details
		const receiverId = req.userId;
		const { conversationId } = req.body;

		// Find and updated messages
		await Message.find({ conversationId, receiverId }).updateMany({
			isRead: true,
		});

		// Success response
		return new SuccessResponse(res).send();
	} catch (error) {
		// Logging the error details and return error response
		logger.error(error);
		return new ErrorResponse(res).send();
	}
};

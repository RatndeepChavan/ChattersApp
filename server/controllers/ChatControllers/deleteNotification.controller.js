import Notification from "#src/models/NotificationModel";
import logger from "#src/utils/logger";
import { SuccessResponse } from "#src/utils/responses/SuccessResponse";
import { ErrorResponse } from "#src/utils/responses/ErrorResponse";

/**
 * @memberof controllers.ChatControllers
 *
 * @function deleteNotification
 *
 * @description
 * * <b>`DELETE REQUEST`</b>
 * Delete notification from database using notificationId pass as query parameter in request url.
 *
 * @param {Request} req request sent from client with `notificationId` populated as query parameter.
 * @param {Response} res response generated from server
 *
 * @returns {Response} JSON response with success or error message.
 *  * <b>HTTP response codes</b>
 * - 500 : `Internal server error`
 * - 200 : `Ok`
 */
export const deleteNotification = async (req, res) => {
	try {
		// Extract id from query parameter
		const { notificationId } = req.query;

		// Delete notification
		await Notification.findByIdAndDelete(notificationId);

		// Successful response
		return new SuccessResponse(res).send();
	} catch (error) {
		// log the error and return error response.
		logger.error(error);
		return new ErrorResponse(res).send();
	}
};

import Conversation from "#src/models/ConversationModel";
import Notification from "#src/models/NotificationModel";
import User from "#src/models/UserModel";
import Queue from "bull";
import logger from "#src/utils/logger";
import { REDIS_HOST, REDIS_PORT } from "#src/utils/constants";

// Bull queue for chat initiation processes with default Redis credentials
export const chatInitiationQueue = new Queue("my-first-queue", {
	redis: {
		host: REDIS_HOST,
		port: REDIS_PORT,
	},
});

/**
 * @memberof workers.notificationWorkers
 *
 * @function chatInitiationQueue
 *
 * @description
 * Process jobs in the chat initiation queue.
 *
 * @param {Object} job - The job data.
 * @param {Object} job.data - The job payload containing senderId, receiverId, and conversationId.
 * @param {string} job.data.senderId - The ID of the user initiating the chat.
 * @param {string} job.data.receiverId - The ID of the user receiving the chat request.
 * @param {string} [job.data.conversationId] - The ID of the existing conversation (if any).
 * @param {Function} done - Callback to signal job completion.
 */
chatInitiationQueue.process(async (job, done) => {
	const { senderId, receiverId } = job.data;
	let { conversationId } = job.data;

	// MongoDB session transactional operations
	const session = await Conversation.startSession();
	session.startTransaction();

	try {
		// Create new or update existing conversation
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

			conversationId = newConversation.at(0)["_id"];
		}

		// Create new or update existing notification
		await Notification.findOneAndUpdate(
			{ conversationId },
			{
				$set: {
					senderId,
					receiverId,
					conversationId,
					message: "Sent you request to initiate chat.",
				},
			},
			{
				upsert: true,
				session,
			},
		);

		// Update user for new notifications
		await User.findOneAndUpdate(
			{
				_id: receiverId,
			},
			{ newNotification: true },
		).session(session);

		await session.commitTransaction();
	} catch (error) {
		// log error and rollback
		logger.error(error);
		await session.abortTransaction();
	} finally {
		session.endSession();
	}
	done();
});

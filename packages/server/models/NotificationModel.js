import mongoose from "mongoose";

const Schema = mongoose.Schema;

const notificationSchema = new Schema(
	{
		senderId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			require: true,
		},
		receiverId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			require: true,
		},
		conversationId: {
			type: Schema.Types.ObjectId,
			ref: "Conversation",
			require: true,
		},
		message: {
			type: String,
		},
	},
	{ timestamps: true },
);

notificationSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;

import mongoose from "mongoose";

const Schema = mongoose.Schema;

const messageSchema = new Schema(
	{
		conversationId: {
			type: Schema.Types.ObjectId,
			ref: "Conversation",
			require: true,
		},
		senderId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			require: true,
		},
		receiverId: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
		message: {
			type: String,
			require: true,
		},
		isRead: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	},
);

messageSchema.index({ conversationId: 1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;

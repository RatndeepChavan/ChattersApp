import mongoose from "mongoose";

const Schema = mongoose.Schema;

const conversationSchema = new Schema(
	{
		initiator: {
			type: Schema.Types.ObjectId,
			ref: "User",
			require: true,
		},
		target: {
			type: Schema.Types.ObjectId,
			ref: "User",
			require: true,
		},
		status: {
			type: String,
			enum: ["PENDING", "ACCEPTED", "REJECTED", "BLOCKED"],
			default: "PENDING",
		},
		attempts: {
			type: Number,
			default: 1,
		},
	},
	{
		timestamps: true,
	},
);

conversationSchema.index({ initiator: 1, target: 1, groupId: 1 }, { unique: true });

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;

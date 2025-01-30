import { genSalt, hash } from "bcrypt";
import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema(
	{
		email: {
			type: String,
			unique: true,
		},
		mobile: {
			type: String,
			unique: true,
		},
		password: {
			type: String,
			required: [true, "Password is required"],
		},
		username: {
			type: String,
			required: false,
		},
		status: {
			type: String,
			required: false,
		},
		image: {
			type: String,
			required: false,
		},
		profileSetup: {
			type: Boolean,
			default: false,
		},
		newNotification: {
			type: Boolean,
			default: false,
		},
		isVerify: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	},
);

// Custom validation to ensure either email or mobileNumber is provided
userSchema.pre("validate", function (next) {
	if (!this.email && !this.mobile) {
		const error = new mongoose.Error.ValidationError();
		error.addError(
			"Required data",
			new mongoose.Error.ValidatorError({
				message: "Either email or mobile number must be provided.",
			}),
		);
		return next(error);
	}
	next();
});

// Hash password before saving
userSchema.pre("save", async function (next) {
	const salt = await genSalt();
	this.password = await hash(this.password, salt);
	next();
});

const User = mongoose.model("User", userSchema);

export default User;

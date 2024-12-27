import User from "#src/models/UserModel";
import logger from "#src/utils/logger";
import { ErrorResponse } from "#src/utils/responses/ErrorResponse";
import { SuccessResponse } from "#src/utils/responses/SuccessResponse";
import { userGetQueryFilter } from "#src/utils/queryHelpers/userQueryFilter";
import { OTPValidator } from "#src/utils/OTPHandler";
import { COOKIE_OPTIONS, JWT_ACCESS_TOKEN_AGE, JWT_REFRESH_TOKEN_AGE } from "#src/utils/constants";
import { jwtTokenGenerator } from "#src/helpers/jwtTokenGenerator";
import otpSchema from "#src/validations/otpSchema";
import emailOrMobileSchema from "#src/validations/emailOrMobileSchema";
import { userObjectFilter } from "#src/helpers/userObjectFilter";

/**
 * @memberof controllers.AuthControllers
 *
 * @function otpValidation
 *
 * @description
 * * <b>`POST REQUEST`</b>
 * - Controller function to handle OTP validation request.
 * - It verifies user-provided details using yup based validation schema.
 * - If user does not exist then return 400 else verify otp for login.
 * - Update user verify status to true if it was false.
 * - If otp is valid then set up jwt tokens in client's machine.
 *
 * @param {Request} req request sent from client
 * @param {string} req.body.emailOrMobile user's email or mobile number
 * @param {string} req.body.otp user's otp for validation
 * @param {Response} res response generated from server
 *
 * @returns {Response}
 * <b>HTTP response codes</b>
 * - 422 : `Invalid data received. Please resubmit the form`
 * - 400 : `User with (Email : ${user.email} || Mobile : ${user.mobile}) not found. Please sign up.`
 * - 422 : `Invalid OTP`
 * - 500 : `INTERNAL SERVER ERROR`
 * - 200 : `Login successful`
 */
export const validateOTP = async (req, res) => {
	try {
		// Extracting details from request
		const { emailOrMobile, otp } = req.body;

		// Validating request body
		const isValidEmailOrMobile = await emailOrMobileSchema.isValid(emailOrMobile);
		if (!isValidEmailOrMobile) {
			return new ErrorResponse(res).send({
				statusCode: 422,
				message: "Invalid data received. Please resubmit the form",
			});
		}

		// Filtering email and mobile
		const userCredentials = userGetQueryFilter(emailOrMobile);

		// Checking whether user already exits with provided email or mobile
		const user = await User.findOne(userCredentials).lean();
		if (!user) {
			// Generating valid informative error message if user exist with given credentials
			const errorMessage = `User with ${userCredentials.email ? "Email" : "Mobile"} : ${
				userCredentials.email || userCredentials.mobile
			} not found. Please sign up.`;

			return new ErrorResponse(res).send({
				statusCode: 400,
				message: errorMessage,
			});
		}

		// Converting userId to string
		const userId = user["_id"].toString();

		// Validating OTP
		const isValid = await OTPValidator({ userId, otp });
		if (isValid === null) {
			return new ErrorResponse(res).send({ statusCode: 422, message: "Invalid OTP" });
		}

		// Updating that user credentials are verified
		if (!user.isVerify) {
			await User.findOneAndUpdate(userCredentials, { isVerify: true });
		}

		// Generating jwt cookie from user's details
		const { access_token, refresh_token } = jwtTokenGenerator(userId);

		// Setting up the cookie in client's storage
		res.cookie("access_token", access_token, {
			...COOKIE_OPTIONS,
			maxAge: JWT_ACCESS_TOKEN_AGE,
		});
		res.cookie("refresh_token", refresh_token, {
			...COOKIE_OPTIONS,
			maxAge: JWT_REFRESH_TOKEN_AGE,
		});

		// filtering the user's data to avoid sending sensitive info
		const data = userObjectFilter(user);

		// Returning success response
		return new SuccessResponse(res).send({
			data,
			message: "Login Successful",
		});
	} catch (error) {
		// Logging the error details
		logger.error(error);
		return new ErrorResponse(res).send();
	}
};

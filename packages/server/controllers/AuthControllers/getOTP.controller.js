import User from "#src/models/UserModel";
import logger from "#src/utils/logger";
import { ErrorResponse } from "#src/utils/responses/ErrorResponse";
import { SuccessResponse } from "#src/utils/responses/SuccessResponse";
import { userGetQueryFilter } from "#src/utils/queryHelpers/userQueryFilter";
import { OTPGenerator } from "#src/utils/OTPHandler";
import { smsOtpQueue } from "#src/workers/authWorkers/smsAuth.worker";
import { emailOtpQueue } from "#src/workers/authWorkers/emailAuth.worker";
import emailOrMobileSchema from "#src/validations/emailOrMobileSchema";

/**
 * @memberof controllers.AuthControllers
 *
 * @function getOTP
 *
 * @description
 * * <b>`POST REQUEST`</b>
 * - Controller function to send OTP via email/mobile
 * - It verifies user-provided details using yup based validation schema.
 * - If user does not exist then return 400.
 * - If user credentials are not verified then return 403.
 * - Once password is verified but user credentials aren't verified then return 204.
 * - Else if user exist with credential verified then otp is send on user email/mobile.
 *
 * @param {Request} req request sent from client
 * @param {string} req.body.emailOrMobile user's email or mobile number
 * @param {string} req.body.password user's password for login
 * @param {Response} res response generated from server
 * @returns {Response}
 * <b>HTTP response codes</b>
 * - 422 : `Invalid data received. Please resubmit the form`
 * - 400 : `User with (Email : ${user.email} || Mobile : ${user.mobile}) not found. Please sign up.`
 * - 403 : `Provided email/mobile is not verified. Please log in with password.`
 * - 500 : `INTERNAL SERVER ERROR`
 * - 200 : `OTP sent`
 */
export const getOTP = async (req, res) => {
	try {
		// Extracting details from request
		const { emailOrMobile, isResend } = req.body;

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
		const user = await User.findOne(userCredentials);
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

		if (!user.isVerify && !isResend) {
			return new ErrorResponse(res).send({
				statusCode: 403,
				message: "Provided email/mobile is not verified. Please log in with password.",
			});
		}

		// Generating OTP to verify user credentials
		const OTP = await OTPGenerator({ userId: user["_id"] });

		// ! ######################################################################################
		// ?Highest priority is 1, and lower the larger integer
		// Sending otp to user
		if (userCredentials.email) {
			emailOtpQueue.add({ OTP, receiver: userCredentials.email }, { priority: 1 });
		} else {
			smsOtpQueue.add({ OTP, receiver: userCredentials.mobile }, { priority: 1 });
		}
		// ! ######################################################################################

		// Returning success response
		return new SuccessResponse(res).send({
			statusCode: 200,
			data: null,
			message: "OTP sent",
		});
	} catch (error) {
		// Logging the error details
		logger.error(error);
		return new ErrorResponse(res).send();
	}
};

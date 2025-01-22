import User from "#src/models/UserModel";
import logger from "#src/utils/logger";
import { ErrorResponse } from "#src/utils/responses/ErrorResponse";
import { SuccessResponse } from "#src/utils/responses/SuccessResponse";
import { userGetQueryFilter } from "#src/utils/queryHelpers/userQueryFilter";
import { OTPGenerator } from "#src/utils/OTPHandler";
import { smsOtpQueue } from "#src/workers/authWorkers/smsAuth.worker";
import { emailOtpQueue } from "#src/workers/authWorkers/emailAuth.worker";
import emailOrMobileSchema from "#src/validations/emailOrMobileSchema";
import passwordSchema from "#src/validations/passwordSchema";

/**
 * @memberof controllers.AuthControllers
 *
 * @function signUp
 *
 * @description
 * * <b>`POST REQUEST`</b>
 * - Controller function to handle user signup request
 * - It verifies user-provided details using yup based validation schema.
 * - Verify if the user already exists
 * - If user does not exist then creates a new user.
 * - Add worker job to sends an OTP for verification after crating an user.
 *
 * @param {Request} req request sent from client
 * @param {string} req.body.emailOrMobile user's email or mobile number
 * @param {string} req.body.password user's password for login
 * @param {Response} res response generated from server
 *
 * @returns {Response}
 * <b>HTTP response codes</b>
 * - 422 : `Invalid data received. Please resubmit the form`
 * - 409 : `(Email : ${user.email} || Mobile : ${user.mobile}) already exists`
 * - 500 : `INTERNAL SERVER ERROR`
 * - 201 : `NEW USER CREATED`
 */
export const signUp = async (req, res) => {
	try {
		// Extracting details from request
		const { emailOrMobile, password } = req.body;

		// Validating request body
		const isValidEmailOrMobile = await emailOrMobileSchema.isValid(emailOrMobile);
		const iaValidPassword = await passwordSchema.isValid(password);
		if (!isValidEmailOrMobile || !iaValidPassword) {
			return new ErrorResponse(res).send({
				statusCode: 422,
				message: "Invalid data received. Please resubmit the form",
			});
		}

		// Filtering email and mobile
		const userCredentials = userGetQueryFilter(emailOrMobile);

		// Checking whether user already exits with provided email or mobile
		const user = await User.exists(userCredentials);
		if (user) {
			// Generating valid informative error message if user exist with given credentials
			const errorMessage = `${userCredentials.email ? "Email" : "Mobile"} : ${
				userCredentials.email || userCredentials.mobile
			} already exists`;

			return new ErrorResponse(res).send({
				statusCode: 409,
				message: errorMessage,
			});
		}

		if (userCredentials.mobile) {
			if (userCredentials.mobile !== "9819834423") {
				return new ErrorResponse(res).send({
					statusCode: 422,
					message: "Sorry our mobile service is down please use email.",
				});
			}
		}

		// Adding the user in database
		const newUser = await User.create({ ...userCredentials, password });

		// converting user_id to string format
		const userId = newUser["_id"].toString();

		// Generating OTP to verify user credentials
		const OTP = await OTPGenerator({ userId });

		// ! ######################################################################################
		// ?Highest priority is 1, and lower the larger integer
		// Sending otp to user
		if ("email" in userCredentials) {
			emailOtpQueue.add(
				{ OTP, action: "signup", receiver: userCredentials.email },
				{ priority: 1 },
			);
		} else {
			smsOtpQueue.add(
				{ OTP, action: "signup", receiver: userCredentials.mobile },
				{ priority: 1 },
			);
		}
		// ! ######################################################################################

		// Returning success response
		return new SuccessResponse(res).send({
			statusCode: 201,
			data: null,
			message: "NEW USER CREATED",
		});
	} catch (error) {
		// Logging the error details
		logger.error(error);
		return new ErrorResponse(res).send();
	}
};

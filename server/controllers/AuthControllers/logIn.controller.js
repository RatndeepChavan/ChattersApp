import { compare } from "bcrypt";
import User from "#src/models/UserModel";
import logger from "#src/utils/logger";
import { ErrorResponse } from "#src/utils/responses/ErrorResponse";
import { SuccessResponse } from "#src/utils/responses/SuccessResponse";
import { OTPGenerator } from "#src/utils/OTPHandler";
import { userGetQueryFilter } from "#src/utils/queryHelpers/userQueryFilter";
import { COOKIE_OPTIONS, JWT_ACCESS_TOKEN_AGE, JWT_REFRESH_TOKEN_AGE } from "#src/utils/constants";
import { jwtTokenGenerator } from "#src/helpers/jwtTokenGenerator";
import emailOrMobileSchema from "#src/validations/emailOrMobileSchema";
import passwordSchema from "#src/validations/passwordSchema";
import { smsOtpQueue } from "#src/workers/authWorkers/smsAuth.worker";
import { emailOtpQueue } from "#src/workers/authWorkers/emailAuth.worker";
import { userObjectFilter } from "#src/helpers/userObjectFilter";

/**
 * @memberof controllers.AuthControllers
 *
 * @function logIn
 *
 * @description
 * * <b>`POST REQUEST`</b>
 * - Controller function to handle user login via password request.
 * - It verifies user-provided details using yup based validation schema.
 * - If user does not exist then return 400 else verify provided password for login.
 * - Once password is verified but user credentials aren't verified then return 204.
 * - If password and user's credential are verified then set up jwt tokens in client's machine.
 *
 * @param {Request} req request sent from client
 * @param {string} req.body.emailOrMobile user's email or mobile number
 * @param {string} req.body.password user's password for login
 * @param {Response} res response generated from server
 *
 * @returns {Response}
 *
 * <b>HTTP response codes</b>
 * - 422 : `Invalid data received. Please resubmit the form`
 * - 400 : `User with (Email : ${user.email} || Mobile : ${user.mobile}) not found. Please sign up.`
 * - 401 : `Wrong password`
 * - 500 : `INTERNAL SERVER ERROR`
 * - 204 : `Please verify your email/mobile`
 * - 200 : `Login successful`
 */
export const logIn = async (req, res) => {
	try {
		// Extracting details from request
		const { emailOrMobile, password } = req.body;

		// Validating request body
		const isValidEmailOrMobile = emailOrMobileSchema.isValidSync(emailOrMobile);
		const isValidPassword = passwordSchema.isValidSync(password);
		if (!isValidEmailOrMobile || !isValidPassword) {
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

		// Verifying the password provided by user
		const doesPasswordMatched = await compare(password, user.password);
		if (!doesPasswordMatched) {
			return new ErrorResponse(res).send({
				statusCode: 401,
				message: "Wrong password",
			});
		}

		// converting user_id to string format
		const userId = user["_id"].toString();

		// Checking if user credentials are verified
		if (!user.isVerify) {
			// Generating OTP to verify user credentials
			const OTP = await OTPGenerator({ userId });

			// ! ######################################################################################
			// ?Highest priority is 1, and lower the larger integer
			// Sending otp to user
			if (userCredentials.email) {
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

			return new SuccessResponse(res).send({
				statusCode: 204,
				message: "Please verify your email/mobile",
			});
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
		return new SuccessResponse(res).send({ data, message: "Login successful" });
	} catch (error) {
		// Logging the error details
		logger.error(error);
		return new ErrorResponse(res).send();
	}
};

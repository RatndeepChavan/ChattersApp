import Queue from "bull";
import twilio from "twilio";
import logger from "#src/utils/logger";
import {
	TWILIO_ACCOUNT_SID,
	TWILIO_AUTH_TOKEN,
	TWILIO_MESSAGING_SERVICE_SID,
} from "#src/utils/constants";
import { REDIS_HOST, REDIS_PORT } from "#src/utils/constants";

// !ADD THIS JOBS WITH HIGHEST PRIORITY (i.e.queue.add(jobData, { priority: 1 }))
// ?Highest priority is 1, and lower the larger integer
export const smsOtpQueue = new Queue("sms-otp-queue", {
	redis: {
		host: REDIS_HOST,
		port: REDIS_PORT,
	},
});

/**
 * @memberof workers.authWorkers
 *
 * @function smsOtpQueue
 * @description
 * Processes the job to send an OTP message on user mobile number via Twilio.
 *
 * @param {Object} job - The job data.
 * @param {Object} job.data - The job payload containing OTP, action, receiver.
 * @param {string} job.data.OTP - OTP that need to send for user verification or login.
 * @param {string} job.data.action - action is string use to define body of sms.
 * @param {string} [job.data.receiver] - receiver is a user's mobile number on which sms needs to be send.
 * @param {Function} done - Callback to signal job completion.
 */
smsOtpQueue.process(async (job, done) => {
	try {
		// Extracting data from job payload
		const { OTP, action, receiver } = job.data;

		// Defining sms content (body) based on action
		let body;
		if (action === "signup") {
			body = `Welcome Chatter, Your verification otp is : ${OTP}`;
		} else {
			body = `Your login otp is : ${OTP}.`;
		}

		// Initiating twilio client
		const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, { autoRetry: true });

		// Sending sms via twilio api
		await twilioClient.messages.create({
			body,
			messagingServiceSid: TWILIO_MESSAGING_SERVICE_SID,
			to: "+91" + receiver,
		});

		// job completed
		done();
	} catch (error) {
		logger.error(error);
		done(error);
	}
});

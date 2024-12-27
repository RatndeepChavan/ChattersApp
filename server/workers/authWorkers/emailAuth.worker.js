import Queue from "bull";
import sgMail from "@sendgrid/mail";
import logger from "#src/utils/logger";
import { SENDGRID_API_KEY, SENDGRID_SENDER_EMAIL } from "#src/utils/constants";
import { REDIS_HOST, REDIS_PORT } from "#src/utils/constants";

// !ADD THIS JOBS WITH HIGHEST PRIORITY (i.e.queue.add(jobData, { priority: 1 }))
// ?Highest priority is 1, and lower the larger integer
// Queue instance for handling OTP email tasks
export const emailOtpQueue = new Queue("email-otp-queue", {
	redis: {
		host: REDIS_HOST,
		port: REDIS_PORT,
	},
});

/**
 * @memberof workers.authWorkers
 *
 * @function emailOtpQueue
 *
 * @description
 * Processes the job to send an OTP email on user email using Sendgrid
 *
 * @param {Object} job - The job data.
 * @param {Object} job.data - The job payload containing OTP, action, receiver.
 * @param {string} job.data.OTP - OTP that need to send for user verification or login.
 * @param {string} job.data.action - action is string use to define email body.
 * @param {string} [job.data.receiver] - receiver is a user's email address.
 * @param {Function} done - Callback to signal job completion.
 */
emailOtpQueue.process(async (job, done) => {
	try {
		// Extracting data from job payload
		const { OTP, action, receiver } = job.data;

		// Defining email content
		let subject, text, html;
		if (action === "signup") {
			subject = "Verification OTP";
			text = `Welcome Chatter, Your verification otp is : ${OTP}`;
			html = `<h3>Welcome Chatter</h3><br/><p>Your verification otp is : <b>${OTP}</b></p>`;
		} else {
			subject = "Login OTP";
			text = `Your Login otp is : ${OTP}`;
			html = `<p>Your login otp is : <b>${OTP}</b></p>`;
		}

		// setting sendgrid key
		sgMail.setApiKey(SENDGRID_API_KEY);

		// Sending Email to user
		await sgMail.send({
			to: receiver, //  recipient
			from: SENDGRID_SENDER_EMAIL, // sender
			subject,
			text,
			html,
		});

		// job completed
		done();
	} catch (error) {
		logger.error(error);
		done(error);
	}
});

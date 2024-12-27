import morgan from "morgan";
import logger from "#src/utils/logger";
import { ENV } from "#src/utils/constants";

const stream = {
	// Use the http severity to auto log request and response
	write: (message) => {
		// return logger.debug(message.trim());
		const splittedMessage = message.split(" ");

		const method = splittedMessage[0];
		const absoluteUrl = splittedMessage[1];
		const relativeUrl = absoluteUrl.split("v1")[1];
		const status = splittedMessage[2];
		const responseTime = `${splittedMessage[3]} ms`;

		return logger.http({ method, status, relativeUrl, responseTime });
	},
};

const skip = () => {
	return ENV !== "production";
};

// ":remote-addr :method :url :status :res[content-length] - :response-time ms", (default string)
const morganMiddleware = morgan(":method :url :status :response-time ms", { stream, skip });

export default morganMiddleware;

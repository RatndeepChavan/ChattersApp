import { BaseApiResponse } from "#src/utils/responses/BaseApiResponse";

export class ErrorResponse extends BaseApiResponse {
	constructor(res) {
		super(res);
	}

	send({ statusCode = 500, errors = [], message = "Internal server error" } = {}) {
		return this.res.status(statusCode).send({
			status: "error",
			code: statusCode,
			errors,
			message,
		});
	}
}

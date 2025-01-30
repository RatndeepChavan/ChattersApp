import { BaseApiResponse } from "#src/utils/responses/BaseApiResponse";

export class SuccessResponse extends BaseApiResponse {
	constructor(res) {
		super(res);
	}

	send({ statusCode = 200, data = null, message = "Ok" } = {}) {
		return this.res.status(statusCode).send({
			status: "success",
			code: statusCode,
			data,
			message,
		});
	}
}

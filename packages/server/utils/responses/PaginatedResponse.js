import { BaseApiResponse } from "#src/utils/responses/BaseApiResponse";

export class PaginatedResponse extends BaseApiResponse {
	constructor(res) {
		super(res);
	}

	send({ statusCode = 200, data = null, message = "OK", pagination = {}, meta = null } = {}) {
		return this.status(statusCode).send({
			status: "success",
			code: statusCode,
			message,
			data,
			meta: {
				...meta,
				pagination,
			},
		});
	}
}

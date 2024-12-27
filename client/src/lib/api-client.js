import { HOST, REFRESH_TOKEN_ROUTE } from "@/utils/constants";
import axios from "axios";

// Creates a Axios instance
export const apiClient = axios.create({
	baseURL: HOST,
	withCredentials: true,
});

// Variables for refresh token logic
let isRefreshing = false;
let requestQueue = new Set();

// Axios request interceptor to queue the request if isRefreshing
axios.interceptors.request.use((config) => {
	if (isRefreshing) {
		requestQueue.add(config);
	} else {
		return config;
	}
});

/**
 * @memberof Libs
 *
 * @function runQueuedRequests
 *
 * @description
 * Runs all queued requests once the token is refreshed and clear the queue.
 *
 * @returns {void}
 */
const runQueuedRequests = () => {
	requestQueue.forEach(async (request) => {
		// Retry request after token is refreshed
		const response = await new Promise((resolve) => resolve(apiClient(request)));
		return response;
	});
	// Clear the queue after all requests are handled
	requestQueue.clear();

	// Setting isRefreshing false so future request will not get added to queue
	isRefreshing = false;
};

/**
 * @memberof Libs
 *
 * @function refreshToken
 *
 * @description
 * - Attempts to refresh the access token, with exponential backoff
 * - Backed has rate limiter so 429 occurs means limit exceeds.
 * - Also backed returns 401 if refresh token not found in request.
 *
 * @returns {Response|Error} For successful request return response or error if error occur.
 */
const refreshToken = async () => {
	// Initial delay in ms
	let delay = 200;

	// Inner function to handle request attempts with exponential delay
	const makeRequest = async () => {
		try {
			// Request for new access and refresh tokens
			const response = await apiClient.get(REFRESH_TOKEN_ROUTE);

			// If successful, return response
			return response;
		} catch (error) {
			// Too many requests(429) or token not in request(403)
			if (error.response?.status !== 401) {
				return error;
			} else {
				// Wait for the delay before retrying
				delay *= 2;
				await new Promise((resolve) => setTimeout(resolve, delay));

				// Recursive call for the next attempt
				return makeRequest();
			}
		}
	};
	// Initial call to start cycle
	return makeRequest();
};

// Response interceptor to handle token expiration and retries
apiClient.interceptors.response.use(
	// Successful responses pass-through
	(response) => response,
	async (error) => {
		// Extracting require details
		const { config: originalRequest, response: { status, data } = {} } = error;

		// Check if error is due to expired token
		if (status === 401 && data?.message === "TokenExpiredError") {
			// To avoid an infinite loop
			//? Here infinite looping won't occur as we are checking the status and error message which is
			//? specific to refresh token only but it's always good practice to add this condition for safety and
			originalRequest._retry = true;

			if (!isRefreshing) {
				// Set flag to avoid multiple refresh requests
				isRefreshing = true;

				// Retry to get new access and refresh token
				const tokenResponse = await refreshToken();

				// Failed to get token as retry limit exceed
				if (tokenResponse.status >= 400) {
					// Clear the queue
					requestQueue.clear();
					// Reject the request with error
					return Promise.reject(tokenResponse);
				} else {
					const response = await new Promise((resolve) =>
						resolve(apiClient(originalRequest)),
					);
					// Adding macro-tasks to run pending queued task
					Promise.resolve().then(runQueuedRequests);
					return response;
				}
			}
		}
		// Reject immediately for other errors
		return Promise.reject(error);
	},
);

export default apiClient;

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toastNotification } from "@/utils/helpers";

const handleRetry = (count, error) => {
	const { status, response } = error;

	if (!status) {
		toastNotification("error", "CHECK NETWORK CONNECTION");
	}
	if (status === 500 && count < 3) {
		return true;
	}
	const errorMessage = response?.data?.message;
	if (errorMessage) {
		if (errorMessage !== "TokenExpiredError") {
			toastNotification("error", errorMessage);
		}
	} else {
		toastNotification("error", "Something went wrong, please try again");
	}
	return false;
};

/**
 * @memberof Providers
 *
 * @function queryClient
 *
 * @description
 * - QueryClient instance with custom retry logic for API queries.
 * - Retries up to 3 times for server errors (500).
 * - Stops retrying if gets an error responses message.
 * - Stops retrying for network errors.
 * - Displays toast notifications respective to error types.
 *
 * @returns {QueryClient} queryClient - The configured QueryClient instance.
 */
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: handleRetry,
		},
		mutations: {
			retry: handleRetry,
		},
	},
});

/**
 * @memberof Providers
 *
 * @description
 * This component accepts children and provides the query client context to the app.
 *
 * @param {Object} props - The component's props.
 * @param {JSX.Element} props.children - The children components wrapped by the provider.
 * @returns {JSX.Element} The provider rendering the children.
 */
// eslint-disable-next-line
const CustomClientProvider = ({ children }) => {
	return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

export default CustomClientProvider;

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { SEND_REQUEST } from "@/utils/constants";
import { toastNotification } from "@/utils/helpers";
import { useMutation } from "@tanstack/react-query";
import Spinner from "@/components/Spinner";

/**
 * @memberof Components
 *
 * @description
 * A button that sends a friend request and handles UI updates.
 *
 * @param {Object} props - Component properties.
 * @param {string} props.id - The ID of the user to whom the request is sent.
 * @param {Function} [props.setHideCloseButton = undefined] - Optional function to toggle the visibility of the close button (if applicable).
 *
 * @throws {TypeError} Throws an error if the id prop is not provided.
 *
 * @returns {JSX.Element} - The friend request button.
 */
const FriendRequestButton = (props) => {
	const { id, setHideCloseButton } = { ...props };

	// Button reference to update button state after successful response
	const buttonRef = useRef();

	// Ensure `id` is provided
	if (!id) {
		throw TypeError("Id is require to whom user wanna sent a friend request");
	}

	// Function to send friend request using the API.
	const sendRequest = async () => {
		const { data } = await apiClient.post(SEND_REQUEST, { id });
		return data;
	};

	const { mutate, isPending, isSuccess } = useMutation({
		mutationFn: sendRequest,
		onSuccess: (response) => {
			// Updating state of close button's visibility
			if (setHideCloseButton) {
				setHideCloseButton(true);
			}
			// Success notification
			toastNotification("success", response.message);
		},
	});

	// Wrapper function to handle button click and trigger mutation.
	const handleClick = () => {
		mutate();
	};

	return (
		<Button
			size="sm"
			ref={buttonRef}
			className={`h-8 ${isSuccess && "cursor-not-allowed"}`}
			disabled={isSuccess}
			onClick={handleClick}
		>
			{isSuccess ? (
				"Requested"
			) : isPending ? (
				<>
					Sending...
					<span>
						<Spinner />
					</span>
				</>
			) : (
				"Send Request"
			)}
		</Button>
	);
};

export default FriendRequestButton;

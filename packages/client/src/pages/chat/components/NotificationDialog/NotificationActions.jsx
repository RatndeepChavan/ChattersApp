import NotificationButtons from "./NotificationButtons";
import FriendRequestButton from "@/components/FriendRequestButton";
import { apiClient } from "@/lib/api-client";
import { DELETE_NOTIFICATION } from "@/utils/constants";
import { useMutation } from "@tanstack/react-query";
import Spinner from "@/components/Spinner";
import { useState } from "react";

// Simple component that renders X as button placeholder for closing(deleting) notification.
const ButtonToCloseNotification = () => (
	<div
		className="absolute cursor-pointer h-5 w-5 top-2 right-3 p-2 flex justify-center 
        items-center hover:text-gray-500 
        hover:border-2 hover:border-gray-500 hover:rounded-full"
	>
		X
	</div>
);

/**
 * @memberof Pages.chat.components.NotificationDialog
 *
 * @description
 * It handles different actions associated with a notification, including:
 * - Responding to a pending notification using NotificationButton component.
 * - Deleting a notification using ButtonToCloseNotification component.
 * - Re-sending a friend request for rejected notifications via FriendRequestButton component.
 *
 * @param {Object} props - Props for the NotificationActions component.
 * @param {string} props.notificationId - Unique ID of the notification.
 * @param {string} props.notificationStatus - Current status of the notification.
 * @param {number} props.notificationIndex - Index of the notification in the list.
 * @param {Function} props.setNotifications - State setter for the notification list.
 * @param {string} props.senderId - ID of the sender of the notification.
 *
 * @returns {JSX.Element} JSX element that renders
 */
const NotificationActions = (props) => {
	// Destructure props
	const {
		notificationId,
		notificationStatus,
		notificationIndex,
		setNotifications,
		senderId,
		setIsNewChat,
	} = {
		...props,
	};

	// State to handle close button visibility
	const [hideCloseButton, setHideCloseButton] = useState(false);

	// Function that makes DELETE API call
	const deleteNotification = async () => {
		await apiClient.delete(DELETE_NOTIFICATION, { params: { notificationId } });
		return null;
	};

	// Mutation query setup that filter deleted notification on successful api call
	const { mutate, isPending } = useMutation({
		mutationFn: deleteNotification,
		onSuccess: () => {
			setNotifications((prev) => prev.filter((_, i) => i !== notificationIndex));
		},
	});

	// Function that handles ButtonToCloseNotification component click
	const closeNotification = async (event = null) => {
		if (event) event.stopPropagation();
		mutate();
	};

	return (
		<>
			{/* ----------------------------------------------------------
			* Pending state (renders above the card to indicate pending state)
			---------------------------------------------------------- */}
			{isPending && (
				<div className="absolute w-full h-full top-0 bg-muted dark:bg-black opacity-[60%] z-10">
					<Spinner size="lg" />
				</div>
			)}

			{/* ----------------------------------------------------------
				* Action button for respond of pending chat request
				---------------------------------------------------------- */}
			{notificationStatus === "PENDING" ? (
				<NotificationButtons notificationId={notificationId} setIsNewChat={setIsNewChat} />
			) : (
				<>
					{/* ----------------------------------------------------------
					* Close button to delete notification
					---------------------------------------------------------- */}
					{!hideCloseButton && (
						<div onClick={closeNotification}>
							<ButtonToCloseNotification />
						</div>
					)}

					{/* ----------------------------------------------------------
						* Button to send request for rejected notifications
						---------------------------------------------------------- */}
					{notificationStatus === "REJECTED" && (
						<div
							className=" pb-2 flex gap-5 justify-center items-center"
							onClick={(e) => e.stopPropagation()}
						>
							<FriendRequestButton
								id={senderId}
								setHideCloseButton={setHideCloseButton}
							/>
						</div>
					)}
				</>
			)}
		</>
	);
};

export default NotificationActions;

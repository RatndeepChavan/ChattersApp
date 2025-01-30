import { apiClient } from "@/lib/api-client";
import { FETCH_NOTIFICATIONS } from "@/utils/constants";
import { ScrollArea } from "@/components/ui/scroll-area";
import ProfileCard from "@/components/ProfileCard";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProfileStore, useUserStore } from "@/store";
import NotificationActions from "@/pages/chat/components/NotificationDialog/NotificationActions";
import { BellIcon, XIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import ProfileCardSkeleton from "@/components/Skeletons/ProfileCardSkeleton";
import { useSocketEventListener } from "@/hooks/useSocketListener";

/**
 * @namespace Pages.chat.components.NotificationDialog
 * @description Displays and manages notifications for the user.
 */

/**
 * @memberof Pages.chat.components.NotificationDialog
 *
 * @description
 * - The `NotificationDialog` component is responsible for handling user notifications,
 * - This component uses socket hook to keep the user updated in real time.
 * - IT displays notification in scroll area using profile card component.
 * - Also this component is responsible to render and handle appropriate responds as per notification status
 *
 * The component:
 * - Pending : Skeleton component while fetching notification data via api
 * - Buttons : Buttons that allow user to responds on notification.
 * - Main Component : `shadcn/ui` ScrollArea component with ProfileCard component's list that renders notification details.
 *
 * Hooks:
 * - `useUserStore`: Zustand store hook for managing user-related information.
 * - `useProfileStore`: Zustand store hook for managing profile IDs of profile page.
 * - `useQuery`: React Query hook to fetch user data from an API.
 * - `useMutation`: React Query hook to fetch user data from an API on user's interaction.
 * - `useState`: React hook to handle various state variables between renders.
 * - `useEffect`: React hook to perform side effects and keep user updated in real time.
 *
 * @returns {JSX.Element} Returns  ScrollArea component with list of notifications.
 */

const Notifications = (props) => {
	const { setIsNewChat } = { ...props };
	const navigate = useNavigate();
	const { userInfo } = useUserStore();
	const { setProfileId } = useProfileStore();

	// state to handle notification dialog visibility
	const [isOpen, setIsOpen] = useState(false);

	// state to hold notification data
	const [notifications, setNotifications] = useState(undefined);

	// state to indicate if user receive any new notifications
	const [newNotification, setNewNotification] = useState(userInfo?.newNotification || false);

	// Side effect to handle real time notification
	useSocketEventListener("newNotification", () => {
		setNewNotification(true);
	});

	// function to fetch notification details
	const fetchNotifications = async () => {
		const { data } = await apiClient.get(FETCH_NOTIFICATIONS);
		userInfo.newNotification = false;
		setNotifications(data.data);
		return data.data;
	};

	const { isFetching } = useQuery({
		queryKey: ["fetchNotifications"],
		queryFn: fetchNotifications,
		enabled: isOpen,
	});

	// Function to handle profile page navigation
	const navigateToProfile = async (profileId) => {
		setProfileId(profileId);
		navigate("/profile");
	};

	// Function to handle click on Icon div
	const handleIconClick = () => {
		// ! DON'T REMOVE THIS SET
		// ? By setting notification undefine will force all child component to re-render as notificationId
		// ? is not changing (because backend updates same notification instead of recreating another one)
		setNotifications(undefined);
		setIsOpen((prev) => !prev);
		if (!isOpen) {
			setNewNotification(false);
		}
	};

	return (
		<div className={`w-full flex ${isOpen ? "flex-col" : "flex-col-reverse"}`}>
			{/* ----------------------------------------------------------
				* Notifications Container (ScrollArea)
				---------------------------------------------------------- */}
			<ScrollArea
				className={`h-80 rounded-md w-full border border-8 dark:bg-black px-3 pt-3 ${
					isOpen ? "" : "hidden"
				}`}
			>
				<div className="w-full">
					{isFetching ? (
						/* ----------------------------------------------------------
							* Skeleton for pending state
							---------------------------------------------------------- */
						<>
							<ProfileCardSkeleton />
							<ProfileCardSkeleton />
							<ProfileCardSkeleton />
						</>
					) : /* ----------------------------------------------------------
							* Notification List
							---------------------------------------------------------- */
					notifications ? (
						notifications.map((notification, index) => {
							return (
								<div
									key={notification["_id"] || index}
									className="relative mb-4 w-full hover:opacity-[70%]"
									onClick={() => navigateToProfile(notification.senderId)}
								>
									{/* ----------------------------------------------------------
										* Notification Card with buttons
										---------------------------------------------------------- */}
									<div
										className={`w-full relative rounded-lg ${
											notification.conversationStatus === "ACCEPTED"
												? "bg-green-200 dark:bg-green-800"
												: notification.conversationStatus === "REJECTED"
												? "bg-red-200 dark:bg-red-800"
												: notification.conversationStatus === "BLOCKED"
												? "bg-gray-200 dark:bg-gray-800"
												: "bg-yellow-200 dark:bg-yellow-800"
										} gap-3 items-center justify-center`}
									>
										{/* ----------------------------------------------------------
											* Profile Card
											---------------------------------------------------------- */}
										<div className="p-2">
											<ProfileCard
												image={notification.senderImage}
												title={notification.senderUsername}
												description={notification.message}
											/>
										</div>

										{/* ----------------------------------------------------------
											* Actions
											---------------------------------------------------------- */}
										<NotificationActions
											notificationId={notification["_id"]}
											notificationStatus={notification.conversationStatus}
											notificationIndex={index}
											setNotifications={setNotifications}
											senderId={notification.senderId}
											setIsNewChat={setIsNewChat}
										/>
									</div>
								</div>
							);
						})
					) : (
						<div>No data found.</div>
					)}
				</div>
			</ScrollArea>

			{/* ----------------------------------------------------------
				* Notification Bell / Close Icon
				---------------------------------------------------------- */}
			<div className="w-full h-24 flex justify-center items-center">
				<div
					className="w-[40px] h-[40px] relative cursor-pointer border border-2 dark:border-white border-black rounded-full flex items-center justify-center hover:opacity-[70%]"
					onClick={handleIconClick}
				>
					<div className="flex">
						{newNotification && (
							<span className="w-2.5 h-2.5 bg-red-600 rounded-full blur-[2px] absolute -top-2 -right-2"></span>
						)}
					</div>
					{isOpen ? <XIcon /> : <BellIcon />}
				</div>
			</div>
		</div>
	);
};

export default Notifications;

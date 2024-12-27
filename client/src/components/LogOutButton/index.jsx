import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { apiClient } from "@/lib/api-client";
import { LOGOUT_ROUTE } from "@/utils/constants";
import { toastNotification } from "@/utils/helpers";
import { useCurrentChatStore, useProfileStore, useUserStore } from "@/store";
import { LucidePowerOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import Spinner from "@/components/Spinner";

/**
 * @memberof Components
 *
 * @description
 * - A button component to log the user out.
 * - Handles API using useMutate from react query.
 * - On successful response updates all local states and redirects to authentication page.
 * - Displays a spinner element when api call is in progress.
 *
 * @returns {JSX.Element} The logout button component.
 */
const LogOutButton = () => {
	const { setUserInfo } = useUserStore();
	const { setProfileId } = useProfileStore();
	const { setCurrentChat } = useCurrentChatStore();
	const navigate = useNavigate();

	// API call to log out the user.
	const logOut = async () => {
		const response = await apiClient.get(LOGOUT_ROUTE);
		return response.data;
	};

	const { mutate, isPending } = useMutation({
		mutationFn: logOut,
		onSuccess: (response) => {
			// Notify user of success.
			toastNotification("success", response.message);

			// Clear all states.
			setUserInfo(undefined);
			setProfileId(undefined);
			setCurrentChat(undefined);
			navigate("/auth");
		},
	});

	// Handles logout button click and prevent accidental clicks.
	const handleClick = () => {
		if (!isPending) {
			mutate();
		}
	};

	return (
		<Avatar
			title="Log Out"
			className="w-full h-full cursor-pointer border-2 border-black dark:border-white hover:opacity-[60%]"
		>
			{isPending ? (
				<Spinner size="md" />
			) : (
				<AvatarFallback onClick={handleClick}>
					<LucidePowerOff />
				</AvatarFallback>
			)}
		</Avatar>
	);
};

export default LogOutButton;

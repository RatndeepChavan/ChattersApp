import { PlusIcon } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useRef, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { GET_USERS } from "@/utils/constants";
import ProfileCard from "@/components/ProfileCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import FriendRequestButton from "@/components/FriendRequestButton";
import { useNavigate } from "react-router-dom";
import { useProfileStore } from "@/store";
import { useMutation } from "@tanstack/react-query";
import { useDebouncedQuery } from "@/hooks/useDebouncedQuery";
import ProfileCardSkeleton from "@/components/Skeletons/ProfileCardSkeleton";

const DEBOUNCE_DELAY = 300; // in milliseconds

/**
 * @memberof Pages.chat.components
 *
 * @description
 * - AddChatButton Component to search for users by username and send friend requests.
 * - It has input field that auto fetch user by input using debouncing logic.
 *
 * @returns {JSX.Element}  JSX element of PlusIcon which opens a search dialog on clicking.
 */
const AddChatButton = () => {
	const inputRef = useRef();
	const [users, setUsers] = useState([]);
	const navigate = useNavigate();
	const { setProfileId } = useProfileStore();

	// Function to fetch users
	const fetchUsers = async () => {
		const text = inputRef.current.value || "";
		const { data } = await apiClient.post(GET_USERS, { text });
		return data.data || [];
	};

	// Mutation to handle API call
	const { mutate, isPending } = useMutation({
		mutationFn: fetchUsers,
		onSuccess: (data) => {
			setUsers(data);
		},
	});

	// Debounced function to trigger the query
	const debouncedFetch = useDebouncedQuery(() => {
		mutate();
	}, DEBOUNCE_DELAY);

	// Function to handle input field's onChange event
	const handleInputChange = () => {
		debouncedFetch(); // Trigger the debounced query
	};

	// Function that Navigates to a user's profile page
	const navigateToProfile = async (profileId) => {
		setProfileId(profileId);
		navigate("/profile");
	};

	return (
		<Dialog>
			{/* ----------------------------------------------------------
                * Icon to trigger the Dialog box
                ---------------------------------------------------------- */}

			<DialogTrigger asChild>
				<div
					onClick={mutate}
					className="rounded-full border-2 border-black dark:border-white hover:opacity-[80%]"
				>
					<PlusIcon />
				</div>
			</DialogTrigger>

			<DialogContent>
				{/* ----------------------------------------------------------
					* Dialog Header with input
					---------------------------------------------------------- */}

				<DialogHeader>
					<DialogTitle className="mb-5">Search Friend by Username</DialogTitle>
					<DialogDescription>
						<Input
							ref={inputRef}
							placeholder="Enter Username"
							onChange={handleInputChange}
						/>
					</DialogDescription>
				</DialogHeader>

				{/* ----------------------------------------------------------
					* Dialog main body
					---------------------------------------------------------- */}
				<ScrollArea className="h-64 rounded-md w-full">
					<div className="w-full">
						{isPending ? (
							<div>
								<ProfileCardSkeleton />
								<ProfileCardSkeleton />
								<ProfileCardSkeleton />
								<ProfileCardSkeleton />
							</div>
						) : users.length > 0 ? (
							users.map((user, index) => (
								<div
									key={user["_id"] || index}
									className="relative mt-2 pb-2 cursor-pointer border-b-2 border-b-muted"
									onClick={() => navigateToProfile(user["_id"])}
								>
									<div
										className="absolute right-5 top-[45%] -translate-y-1/2"
										onClick={(e) => {
											e.stopPropagation();
										}}
									>
										<FriendRequestButton id={user["_id"]} />
									</div>
									<ProfileCard
										image={user?.image}
										title={user?.username}
										description={user?.status}
									/>
								</div>
							))
						) : (
							<div>No user found</div>
						)}
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
};

export default AddChatButton;

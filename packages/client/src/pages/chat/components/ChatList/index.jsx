import { ScrollArea } from "@/components/ui/scroll-area";
import { apiClient } from "@/lib/api-client";
import { GET_CHATS, UPDATE_READ_STATE } from "@/utils/constants";
import ProfileCard from "@/components/ProfileCard";
import { useCurrentChatStore } from "@/store";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useSocketEventListener } from "@/hooks/useSocketListener";
import Spinner from "@/components/Spinner";

/**
 * @memberof Pages.chat.components
 *
 * @description
 * - This component is responsible to display all friend user.
 * - In real time if user receives new message then it displays count of messages on right side.
 * - It is a ScrollArea element which allows user to scroll if friend list is overflows.
 *
 * @returns {JSX.Element} ScrollArea component with friend list.
 */
const ChatList = (props) => {
	const { chatBoxVisibilityHandler, isNewChat, setIsNewChat } = { ...props };
	const { currentChat, setCurrentChat } = useCurrentChatStore();
	const [unreadMessageCount, setUnreadMessageCount] = useState({});

	// Socket event listener that handle unread message count in real time
	useSocketEventListener("chatMessage", (newMessage) => {
		const { senderId } = newMessage.data;
		setUnreadMessageCount((prev) => {
			const prevCount = prev[senderId] || 0;
			return { ...prev, [senderId]: prevCount + 1, [currentChat?._id]: 0 };
		});
	});

	// Function that make api call to fetch current chat list
	const getChats = async () => {
		const { data } = await apiClient.get(GET_CHATS);
		const chats = data.data;
		const unreadMessages = {};

		// Creating object variable that has key as userId and value is count of unread messages
		chats.forEach((chat) => {
			unreadMessages[chat["_id"]] = chat.unreadMessageCount;
		});
		setUnreadMessageCount(unreadMessages);
		setIsNewChat(false);

		return chats;
	};

	// Define useQuery hook to make api call and handle call states
	const {
		data: chats,
		isPending,
		refetch,
	} = useQuery({
		queryKey: ["getChats"],
		queryFn: getChats,
	});

	// Side effect to refetch chat list when user accept chat initiation request (friend request) sent from other user
	useEffect(() => {
		refetch();
	}, [isNewChat, refetch]);

	// Side effect to refetch chat list when current user has send chat initiation request (friend request)
	// to other user and that user has accepted the request
	useSocketEventListener("newNotification", ({ feedback }) => {
		if (feedback === "Accept") {
			refetch();
		}
	});

	// Function to make all unread messages to read when user open a conversation
	const updateReadState = async (chat) => {
		await apiClient.post(UPDATE_READ_STATE, { conversationId: chat.conversationId });
		return chat._id;
	};

	// Define mutation hook to make isRead status of all messages as true when user open a conversation via api call
	const { mutate } = useMutation({
		mutationFn: updateReadState,
		onSuccess: (chatId) => {
			setUnreadMessageCount((prev) => {
				return { ...prev, [chatId]: 0 };
			});
		},
	});

	// Function to handle click on user card and perform side effects
	const handleClick = (chat) => {
		chat.unreadMessageCount = unreadMessageCount[chat._id];
		setCurrentChat(chat);
		chatBoxVisibilityHandler();
		mutate(chat);
	};

	return isPending ? (
		<div className="h-full w-full flex justify-center items-center">
			{/* ----------------------------------------------------------
				* Spinner element 
				---------------------------------------------------------- */}
			<Spinner size="xl" />
		</div>
	) : (
		<ScrollArea className="h-full rounded-md w-full">
			{chats ? (
				chats.map((chat) => (
					<div
						key={chat["_id"]}
						id={chat["_id"]}
						className="mt-2 p-2 w-full relative hover:opacity-[70%] bg-muted"
						onClick={() => handleClick(chat)}
					>
						{/* ----------------------------------------------------------
							* Unread messages count
							---------------------------------------------------------- */}
						{unreadMessageCount[chat._id] > 0 && (
							<div className="absolute top-0 left-0 w-full h-full flex items-center justify-end">
								<div className="flex items-center justify-center me-5 px-2 rounded-full bg-cyan-300 dark:bg-cyan-800">
									{unreadMessageCount[chat._id]}
								</div>
							</div>
						)}
						{/* ----------------------------------------------------------
							* Chat card
							---------------------------------------------------------- */}
						<ProfileCard
							image={chat.image}
							title={chat.username}
							description={chat.status}
						/>
					</div>
				))
			) : (
				<div>No chats</div>
			)}
		</ScrollArea>
	);
};

export default ChatList;

import ArrowBackLeft from "@/components/ArrowBackLeft";
import { useCurrentChatStore, useProfileStore, useUserStore } from "@/store";
import ProfileCard from "@/components/ProfileCard";
import MessageForm from "@/pages/chat/components/ChatContainer/MessageForm";
import { useEffect, useRef, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { FETCH_MESSAGES } from "@/utils/constants";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import Spinner from "@/components/Spinner";
import ProgressBar from "@/components/ProgressBar";
import { useSocketEventListener } from "@/hooks/useSocketListener";
import { useNavigate } from "react-router-dom";

const LIMIT = 10;

/**
 * @namespace Pages.chat.components.ChatContainer
 * @description Displays and manages user's conversation with other users.
 */

/**
 * @memberof Pages.chat.components.ChatContainer
 *
 * @description
 * - This component is responsible to handle individual conversation.
 * - The header displays receiver details and allow to see full profile by click.
 * - Middle section displays the conversation between two users with positional and color difference.
 * - Conversation fetching uses infinite scroll technique in reverse direction.
 * - i.e. when user scrolls upwards then older messages get fetch with pagination.
 * - The initial loading state displays progress bar while upward loading state displays spinner.
 * - The footer renders Message form which allows user to type and send messages.
 *
 * Hooks:
 * - `useUserStore`: Zustand store hook for managing user-related information.
 * - `useCurrentChatStore`: Zustand store hook for current chat details.
 * - `useProfileStore`: Zustand store hook for managing profile IDs of profile page.
 * - `useMutation`: React Query hook to update messages in database.
 * - `useInfiniteQuery`: React Query hook to conversation from an API with auto infinite scrolling.
 * - `useState`: React hook to handle various state variables between renders.
 * - `useEffect`: React hook to perform side effects and keep user updated in real time.
 *
 * @returns {JSX.Element} Chat container that allow user to interact with other user by sending messages.
 */
const ChatContainer = (props) => {
	// Destruct component props
	const { chatBoxVisibilityHandler } = { ...props };
	const { currentChat, setCurrentChat } = useCurrentChatStore();
	const { userInfo } = useUserStore();
	const [conversations, setConversations] = useState([]);
	const scrollRef = useRef(null);
	const { ref, inView } = useInView();
	const navigate = useNavigate();
	const { setProfileId } = useProfileStore();

	// Listening to socket events and updates conversation for real time communication
	useSocketEventListener("chatMessage", (newMessage) => {
		const { _id, message, senderId } = newMessage.data;
		if (currentChat && currentChat._id === senderId) {
			scrollRef.current = _id;
			setConversations((prev) => [...prev, { _id, message, senderId }]);
		}
	});

	// Function to fetch conversation data with infinite scrolling
	const fetchConversation = async ({ pageParam }) => {
		// Fetch paginated limit message with all unread messages
		// ? See if unread messages are 5 and limit is 10 then normally will fetch 5 read nre messages
		// ? But if unread messages are more than 10 like 20 then user will miss 10 unread messages
		// ? Also this logic will help with scroll position as we want scroll at top of unread messages
		const custom_limit = currentChat ? currentChat.unreadMessageCount + LIMIT : LIMIT;

		// API call to fetch conversation with pagination
		const { data } = await apiClient.post(FETCH_MESSAGES, {
			conversationId: currentChat?.conversationId,
			lastMessageId: pageParam,
			limit: custom_limit,
		});

		// Reorder receive messages.
		const messages = data?.data?.reverse() || [];

		// Conditionally update current conversation
		// ? just returning message only shows fetch conversation and returning prev with messages
		// ? using ... operation will show all previous and newly fetch message but problem is as we
		// ? updating state with previous state if user changes current chat still we see pervious user's
		// ? conversation in it so using page param to avoid it as page param will only be undefined for
		// ? initial fetch of any user.
		setConversations((prev) => {
			if (pageParam) {
				return [...messages, ...prev];
			}
			return messages;
		});

		// This condition will help to save one api call only if
		// totalConversation % LIMIT is not equal to 0.
		if (messages.length < LIMIT) {
			return null;
		}
		const lastMessage = messages[0];

		if (!isFetchingNextPage) {
			// Manage scroll reference for steady ui
			if (custom_limit === LIMIT) {
				scrollRef.current = messages?.at(-1)["_id"];
			} else {
				// ? One less is just to show familiar messages at top
				scrollRef.current = messages?.at(LIMIT - 1)["_id"];
			}
		}

		// Return last message id which will be used for next page fetch
		return lastMessage ? lastMessage["_id"] : null;
	};

	// Define Infinite query hook and extract require values
	const { fetchNextPage, isFetchingNextPage, isPending, isFetching } = useInfiniteQuery({
		queryKey: ["fetchConversation", currentChat],
		queryFn: fetchConversation,
		getNextPageParam: (lastMessageId) => {
			// ? This will handle scroll fluctuation for edge case i.e. totalConversation % LIMIT = 0.
			if (!lastMessageId) {
				scrollRef.current = undefined;
			}
			// Last message id for next page fetching
			return lastMessageId;
		},
	});

	// Handle scroll positioning for initial loading and upward infinite auto fetching.
	useEffect(() => {
		if (scrollRef?.current) {
			const scrollElement = document.getElementById(scrollRef.current);
			scrollElement?.scrollIntoView();
		} else {
			const scrollElement = document.getElementById("customScrollArea");
			scrollElement?.lastElementChild?.scrollIntoView();
		}
	}, [conversations, currentChat]);

	// Intersection observer to auto fetch next page after upward scrolling.
	useEffect(() => {
		if (inView) {
			fetchNextPage();
		}
	}, [inView, fetchNextPage]);

	const navigateToProfile = async () => {
		setProfileId(currentChat?._id);
		navigate("/profile");
	};

	// Function that handle back click and setCurrent chat to null
	const handleArrowBackClick = () => {
		setCurrentChat(null);
		chatBoxVisibilityHandler();
	};

	return currentChat ? (
		isPending || (isFetching && !isFetchingNextPage) ? (
			<ProgressBar text={`Fetching conversation with ${currentChat?.username}`} />
		) : (
			<>
				{/* ----------------------------------------------------------
					* Header to display user details
					---------------------------------------------------------- */}

				<div className="w-full h-[15%] flex gap-3 items-center">
					<div className="w-[70px] h-[70px] md:hidden rounded-full flex items-center justify-center">
						<div
							className="w-[40px] h-[40px] rounded-full flex items-center justify-center cursor-pointer"
							onClick={handleArrowBackClick}
						>
							<ArrowBackLeft />
						</div>
					</div>
					<div className="w-full" onClick={navigateToProfile}>
						<ProfileCard
							image={currentChat?.image}
							title={currentChat?.username}
							description={currentChat?.status}
						/>
					</div>
				</div>

				{/* ----------------------------------------------------------
					* Message Section to display conversion
					---------------------------------------------------------- */}

				<div
					id="customScrollArea"
					className="w-full h-[70%] overflow-y-scroll scrollbar-thin scrollbar-webkit dark:scrollbar-thin-dark dark:scrollbar-webkit-dark"
				>
					{isFetchingNextPage && (
						<div>
							<Spinner size="md" />
						</div>
					)}

					{/* ----------------------------------------------------------
						* Intersection observer div that triggers auto fetching
						---------------------------------------------------------- */}
					<div ref={ref}></div>

					{/* ----------------------------------------------------------
						* Looping over messages
						---------------------------------------------------------- */}
					{conversations?.length > 0 ? (
						conversations.map((conversation, index) =>
							userInfo["_id"] === conversation.senderId ? (
								/* ----------------------------------------------------------
									* User Message div
									---------------------------------------------------------- */
								<div
									className="w-full mt-3 flex justify-end items-center"
									key={index}
									id={conversation["_id"]}
								>
									<div className="w-[60%] rounded-lg bg-purple-200 dark:bg-purple-700 p-3 mx-3 mb-3 whitespace-pre-wrap">
										{conversation.message}
									</div>
								</div>
							) : (
								/* ----------------------------------------------------------
									* Sender Message div
									---------------------------------------------------------- */
								<div
									className="w-full mt-3 flex justify-start items-center whitespace-pre-wrap"
									key={index}
									id={conversation["_id"]}
								>
									<div className="w-[60%] rounded-lg bg-blue-200 dark:bg-cyan-800 p-3 mx-3 mb-3">
										{conversation.message}
									</div>
								</div>
							),
						)
					) : (
						<></>
					)}
				</div>

				{/* ----------------------------------------------------------
					* Footer Section to type and send message
					---------------------------------------------------------- */}

				<div className="w-full h-[15%] flex gap-3 items-center">
					<MessageForm setConversations={setConversations} ref={scrollRef} />
				</div>
			</>
		)
	) : (
		<></>
	);
};

export default ChatContainer;

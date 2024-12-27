import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useUserStore } from "@/store";
import LogOutButton from "@/components/LogOutButton";
import ProfileCard from "@/components/ProfileCard";
import ThemeToggler from "@/components/ThemeToggler";
import ChatList from "./components/ChatList";
import ChatContainer from "./components/ChatContainer";
import AddChatButton from "./components/AddChatButton";
import NotificationDialog from "./components/NotificationDialog";

/**
 * @namespace Pages.chat
 */

/**
 * @memberof Pages.chat
 *
 * @description
 * The most important component where all major business logic work. It has Four main component as :
 * 1. <b>`Chat sidebar`</b> : sidebar that display user info at top then all chats with scrolling and at footer notifications with logout option
 * 2. <b>`Add chat button`</b> : Floating button on chat sidebar header with absolute position which allows user to search and send request to other users.
 * 3. <b>`Notification dialog`</b> : Floating bell icon at sidebar footer with absolute position responsible to open notification dialog box and allow to respond on notifications as per the notification type.
 * 4. <b>`Chat container`</b> : Main container where user can chat with other user. Header displays receivers details, main section shows conversations between two user and footer to send text.
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
 * @returns {JSX.Element} Returns the rendered authentication page.
 *
 * @example
 * // Usage
 * import Chat from './chat';
 *
 * function App() {
 *   return <Chat />;
 * }
 */

const Chat = () => {
	const chatRef = useRef();
	const chatListRef = useRef();
	const { userInfo } = useUserStore();
	const [isNewChat, setIsNewChat] = useState(false);

	// Function to handle chat container element visibility for user
	// ? Large devices has space for both sidebar and main container but small device don't
	// ? So this function add and remove require tailwind classes to allow user to see the messages from other users.
	const chatBoxVisibilityHandler = () => {
		const classes = Array.from(chatRef.current.classList);
		if (chatRef.current.clientWidth === 0 || chatListRef.current.clientWidth === 0) {
			if (classes.includes("hidden")) {
				chatRef.current.classList.remove("hidden");
				chatListRef.current.classList.add("hidden");
			} else {
				chatRef.current.classList.add("hidden");
				chatListRef.current.classList.remove("hidden");
			}
		}
	};

	return (
		<div className="w-screen h-screen relative md:flex flex-row-reverse gap-4">
			{/* ----------------------------------------------------------
				* MAIN CHATTING SECTION
				---------------------------------------------------------- */}
			<div
				className="hidden absolute w-full h-full px-5 md:w-[60%] md:block md:relative"
				ref={chatRef}
			>
				<ChatContainer chatBoxVisibilityHandler={chatBoxVisibilityHandler} />
			</div>

			{/* ----------------------------------------------------------
				* SIDEBAR TO SHOW CHATS AND GROUPS
				---------------------------------------------------------- */}

			<div className="w-full h-full  md:w-[30%] md:w-[40%] relative" ref={chatListRef}>
				{/* ----------------------------------------------------------
					* SIDEBAR Header
					---------------------------------------------------------- */}
				<div className="w-full h-[15%] relative">
					<Link to="/profile">
						<div
							onClick={(event) => event.preventDefault()}
							className="absolute w-full h-full flex justify-end items-center gap-3 pe-3"
						>
							{/* ----------------------------------------------------------
								* Button to add chat
								---------------------------------------------------------- */}
							<div>
								<AddChatButton />
							</div>

							{/* ----------------------------------------------------------
								* Button to change theme
								---------------------------------------------------------- */}
							<div className="h-12 w-12 cursor-pointer">
								<ThemeToggler />
							</div>
						</div>

						{/* ----------------------------------------------------------
							* Header to display user's details
					    	---------------------------------------------------------- */}
						<div className="p-5">
							<ProfileCard
								image={userInfo?.image}
								title={userInfo.username}
								description={userInfo.status}
							/>
						</div>
					</Link>
				</div>

				{/* ----------------------------------------------------------
					* Chats
					---------------------------------------------------------- */}

				<div className="w-full h-[70%] overflow-hidden">
					<ChatList
						chatBoxVisibilityHandler={chatBoxVisibilityHandler}
						isNewChat={isNewChat}
						setIsNewChat={setIsNewChat}
					/>
				</div>

				{/* ----------------------------------------------------------
					* Footer to show logo, notifications and logout option
					---------------------------------------------------------- */}
				<div className="w-full absolute bottom-0 left-0">
					<NotificationDialog setIsNewChat={setIsNewChat} />
				</div>

				<div className="w-full h-[15%] flex ps-5 gap-3 items-center justify-between px-5">
					<div className="">Chatters LOGO</div>
					<div className="w-[40px] h-[40px]">
						<LogOutButton />
					</div>
				</div>
			</div>
		</div>
	);
};

export default Chat;

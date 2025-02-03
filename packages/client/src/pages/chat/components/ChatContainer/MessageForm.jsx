import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { SendHorizontalIcon, SmileIcon, XIcon } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import EmojiPicker from "emoji-picker-react";
import { useRef, useState } from "react";
import { useCurrentChatStore } from "@/store";
import { UPDATE_MESSAGES } from "@/utils/constants";
import { apiClient } from "@/lib/api-client";
import { useMutation } from "@tanstack/react-query";
import Spinner from "@/components/Spinner";
import { forwardRef } from "react";

/**
 * @memberof Pages.chat.components.ChatContainer
 *
 * @function MessageForm
 *
 * @description
 * - This component renders form with input, emoji and send button which allow user to chat and send messages.
 * - Emoji input is handle by third party library `emoji-picker-react`.
 * - Input is looks single line but it is textarea field handle by `react-textarea-autosize`.
 * - Textarea input allow user to add three vertical sentences without scroll and adds scrollbar afterwards.
 * - Whenever user sends message it make POST API call to save data then server broadcast it via socket for real time communication.
 * - To indicate loading state spinner is displayed in ui.
 *
 * @param {Object} props - Props for the component.
 * @param {string} props.setConversations - Function to update conversation state variable.
 *
 * @returns {JSX.Element} JSX element that renders message form footer of chatting screen.
 */
const MessageForm = forwardRef(function MessageForm(props, ref) {
	// Destruct the component props
	const { setConversations } = { ...props };
	const { currentChat } = useCurrentChatStore();
	const messageRef = useRef();
	const [openEmojiPicker, setOpenEmojiPicker] = useState(false);

	// Define form with initial values
	const messageForm = useForm({
		defaultValues: { message: "" },
	});

	// Function to handle emoji input and update the message.
	const handleEmoji = (emoji) => {
		// ? avoiding use of sate variable to reduce re-rendering
		const message = messageRef.current.firstElementChild.value;
		messageForm.setValue("message", message + emoji.emoji);
	};

	// Function to make POST API call to update message db with user message
	// ? Database is center of truth and will avoid any communication gap so it is must to update it with each message.
	const sendMessage = async () => {
		const message = messageRef.current.firstElementChild.value;
		const { data } = await apiClient.post(UPDATE_MESSAGES, {
			receiverId: currentChat["_id"],
			conversationId: currentChat.conversationId,
			message,
		});
		return data.data;
	};

	// Mutation hook to manage api call states and process side effect of successful response.
	const { mutate, isPending } = useMutation({
		mutationFn: sendMessage,
		onSuccess: (data) => {
			const { _id, senderId, message } = data;
			ref.current = _id;
			messageForm.reset();
			setOpenEmojiPicker(false);
			setConversations((prev) => [...prev, { _id, senderId, message }]);
		},
	});

	// Wrapper function to handle submit and trigger mutation function.
	const handleSubmit = (data) => {
		mutate(data);
	};

	return (
		<Form {...messageForm}>
			<form
				onSubmit={messageForm.handleSubmit(handleSubmit)}
				className="flex w-full h-full justify-center items-center"
			>
				{/* ----------------------------------------------------------
					* EmojiPicker
					---------------------------------------------------------- */}
				<div className="relative h-10 w-10 p-2">
					<div className="absolute -translate-y-[103%]">
						<EmojiPicker open={openEmojiPicker} onEmojiClick={handleEmoji} />
					</div>
					<div onClick={() => setOpenEmojiPicker((prev) => !prev)}>
						{openEmojiPicker ? <XIcon /> : <SmileIcon />}
					</div>
				</div>

				{/* ----------------------------------------------------------
					* Autosize textarea input field 
					---------------------------------------------------------- */}
				<FormField
					control={messageForm.control}
					name="message"
					render={({ field }) => (
						<FormItem className="w-[80%] flex h-full justify-center items-center">
							<FormControl>
								<div
									className="flex h-full w-full items-center"
									ref={messageRef}
									onScroll={(e) => e.stopPropagation()}
								>
									<TextareaAutosize
										minRows={1}
										maxRows={3}
										placeholder="Type message"
										className="resize-none flex h-full w-full rounded-md border border-input px-3 py-2 text-sm placeholder:text-muted-foreground bg-secondary dark:bg-muted"
										{...field}
									/>
								</div>
							</FormControl>
						</FormItem>
					)}
				/>

				{/* ----------------------------------------------------------
					* Submit button
					---------------------------------------------------------- */}
				<Button className="ms-2 h-9 w-9" type="submit" size="icon">
					{isPending ? <Spinner /> : <SendHorizontalIcon />}
				</Button>
			</form>
		</Form>
	);
});

export default MessageForm;

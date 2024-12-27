import { REQUEST_FEEDBACK } from "@/utils/constants";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { useMutation } from "@tanstack/react-query";
import Spinner from "@/components/Spinner";
import { useState } from "react";

/**
 * @memberof Pages.chat.components.NotificationDialog
 *
 * @description
 * - NotificationButtons Component that renders button as a response to new chat request.
 * - Renders three buttons as Accept, Reject, Block for user to respond on request.
 * - It handles feedback submission using react-query, and provides UI feedback.
 *
 * @param {Object} props - Component properties
 * @param {string} props.notificationId - ID of the notification
 * @returns {JSX.Element} JSX element that renders three buttons (Accept, Reject, Block)
 */
const NotificationButtons = (props) => {
	// Destructure props
	const { notificationId, setIsNewChat } = { ...props };

	// State to track feedback (i.e. "Accepted", "Rejected", "Blocked")
	const [feedbackSent, setFeedbackSent] = useState("");

	// function to send feedback using post api
	const notificationFeedback = async ({ feedback }) => {
		await apiClient.post(REQUEST_FEEDBACK, { feedback, notificationId });
		return feedback;
	};

	// Mutation query setup
	const { mutate, isPending } = useMutation({
		mutationFn: notificationFeedback,
		onSuccess: (feedback) => {
			setFeedbackSent(feedback + "ed");
			if (feedback === "Accept") {
				setIsNewChat((prev) => !prev);
			}
		},
	});

	// Function to handle feedback button click
	const handleClick = async (e) => {
		e.stopPropagation();
		const feedback = e.target.innerText;
		mutate({ feedback });
	};

	return (
		<div
			className="mt-1 pb-2 flex gap-5 justify-center items-center"
			onClick={(e) => e.stopPropagation()}
		>
			<>
				{isPending ? (
					<span>
						{/* ----------------------------------------------------------
						* Spinner element to indicate pending state
						---------------------------------------------------------- */}
						<Spinner size="lg" />
					</span>
				) : feedbackSent ? (
					/* ----------------------------------------------------------
						* Feedback message to display after user respond to pending notification
						---------------------------------------------------------- */
					<div className="italic font-bold text-gray-600 dark:text-gray-400 text-sm pb-3 flex justify-center">
						You have {feedbackSent} this request.
					</div>
				) : (
					<>
						{/* ----------------------------------------------------------
							* Accept Button
							---------------------------------------------------------- */}
						<Button
							size="sm"
							className="h-8 bg-green-600 hover:bg-green-500"
							disabled={isPending}
							onClick={(event) => handleClick(event, notificationId)}
						>
							Accept
						</Button>

						{/* ----------------------------------------------------------
							* Reject Button
							---------------------------------------------------------- */}
						<Button
							variant="destructive"
							size="sm"
							className="h-8 hover:bg-red-400"
							disabled={isPending}
							onClick={(event) => handleClick(event, notificationId)}
						>
							Reject
						</Button>

						{/* ----------------------------------------------------------
							* Block Button
							---------------------------------------------------------- */}
						<Button
							size="sm"
							className="h-8 hover:opacity-[80%]"
							disabled={isPending}
							onClick={(event) => handleClick(event, notificationId)}
						>
							Block
						</Button>
					</>
				)}
			</>
		</div>
	);
};

export default NotificationButtons;

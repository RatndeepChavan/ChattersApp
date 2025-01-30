import { toast } from "@/hooks/use-toast";
import { TOAST_NOTIFICATION_DURATION } from "@/utils/constants";

/**
 * @memberof Utils
 *
 * @function handleKeyDown
 *
 * @description
 * Prevent form submission via Enter key if the form is in a pending state (loading).
 *
 * @param {KeyboardEvent} event - The keyboard event.
 */
export const handleKeyDown = (event, isPending) => {
	if (isPending && event.key === "Enter") {
		event.preventDefault();
	}
};

/**
 * @memberof Utils
 *
 * @function toastNotification
 *
 * @description
 * Function to generate shadcn toast notification based on action provided
 *
 * @param {string} action "info" | "success" | "error"
 * @param {string} message message string received from backend response
 */
export const toastNotification = (action, message) => {
	switch (action) {
		case "info":
			// Informative notification
			toast({
				variant: "info",
				title: "Information : ",
				description: message,
				duration: TOAST_NOTIFICATION_DURATION,
			});
			break;
		case "success":
			// Success notification
			toast({
				variant: "success",
				title: "Success : ",
				description: message,
				duration: TOAST_NOTIFICATION_DURATION,
			});
			break;
		case "error":
			// Error notification
			toast({
				variant: "destructive",
				title: "Error Occur : ",
				description: message,
				duration: TOAST_NOTIFICATION_DURATION,
			});
			break;
	}
};

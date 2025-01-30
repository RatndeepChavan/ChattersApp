import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { yupResolver } from "@hookform/resolvers/yup";
import detailsValidationSchema from "@/validations/UserDetails";
import { useUserStore } from "@/store";
import { apiClient } from "@/lib/api-client";
import { UPDATE_USER_ROUTE } from "@/utils/constants";
import { toastNotification } from "@/utils/helpers.js";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import SubmitButton from "@/components/SubmitButton";
import FormInputField from "@/components/FormInputField";
import { useMutation } from "@tanstack/react-query";

/**
 * @memberof Pages.profile.components
 *
 * @description
 * - DetailsForm that allow user to update their profile.
 * - It includes fields for username and status.
 * - The image prop in handle by prop lifting technique.
 * - To handle form events `useForm` hook from `react-hook-form` is used.
 * - Form is rendered using `shadcn Form component`.
 * - Validation is applied using Yup resolver and a mutation is triggered upon form submission.
 * - `Reach Query` and `axios` is used for making <b>`POST request`</b>
 * - On successful request user will redirects  to chat page.
 *
 * @param {Object} props - Component properties.
 * @param {string} [props.image=""] - Optional image in base64 sting format for user profile.
 *
 * @returns {JSX.Element} JSX form element that allow user to update their profile.
 */
const DetailsForm = (props) => {
	const { image } = { ...props };
	const navigate = useNavigate();
	const { userInfo, setUserInfo } = useUserStore();

	// Defining form with initial values and validation schema
	const detailsForm = useForm({
		defaultValues: {
			username: "",
			status: "",
		},

		resolver: yupResolver(detailsValidationSchema),
	});

	// Reset form values when userInfo changes
	useEffect(() => {
		if (userInfo) {
			detailsForm.reset({
				username: userInfo.username,
				status: userInfo.status,
			});
		}
	}, [userInfo, detailsForm]);

	// Mutation hook for handling form submission via an API call using POST method
	const { mutate, isPending } = useMutation({
		// Function make API call
		mutationFn: (data) => apiClient.post(UPDATE_USER_ROUTE, data),

		// handling successful response
		onSuccess: (response) => {
			const responseData = response.data;

			// Update user store
			setUserInfo(responseData.data);

			// Success notification
			toastNotification("success", responseData?.message || "Profile Updated");
			navigate("/chat");
		},
	});

	// Function to handle form submission
	const handleFormSubmit = (data) => {
		// ! Do not assign image as default value as it is handle by state lifting
		// ! updating it just before mutate call makes it more reliable
		data.image = image || "";
		mutate(data);
	};

	return (
		<Form {...detailsForm}>
			<form
				onSubmit={detailsForm.handleSubmit(handleFormSubmit)}
				className="space-y-8 w-[90%]"
				id="user-details-form"
			>
				{/* ----------------------------------------------------------
                    *Username Field
                    ---------------------------------------------------------- */}

				<FormInputField
					control={detailsForm.control}
					name="username"
					placeholder="Enter your username"
				/>

				{/* ----------------------------------------------------------
                    *Status Field
                    ---------------------------------------------------------- */}

				<FormInputField
					control={detailsForm.control}
					name="status"
					placeholder="Enter your status"
				/>

				{/* ----------------------------------------------------------
                    * Submit Button
                    ---------------------------------------------------------- */}

				<SubmitButton isPending={isPending} />
			</form>
		</Form>
	);
};

export default DetailsForm;

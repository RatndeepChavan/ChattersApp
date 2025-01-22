import { Button } from "@/components/ui/button";
import Spinner from "@/components/Spinner";

/**
 * @memberof Components
 *
 * @description
 * - SubmitButton component can be use inside form tag to submit the form data
 * - It renders loading spinner when form submission is pending with text 'Submitting...'.
 *
 * @param {Object} props -  The props object for the component.
 * @param {boolean} [props.isPending=false] - Indicates if the submission process is ongoing.
 *
 * @returns {JSX.Element} A button that shows "Submitting..." with a spinner when `isPending` is true,
 *                        otherwise shows "Submit".
 */
const SubmitButton = (props) => {
	const { isPending } = { ...props };
	return (
		<Button
			type="submit"
			className="w-full rounded-full flex justify-center items-center gap-4"
			disabled={isPending || false} // Disable the button if isPending is true
		>
			{isPending ? (
				<>
					<span>Submitting...</span>
					<span>
						{/* Spinner component */}
						<Spinner size="md" />
					</span>
				</>
			) : (
				"Submit"
			)}
		</Button>
	);
};

export default SubmitButton;

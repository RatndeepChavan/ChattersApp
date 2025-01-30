import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

// constant values
const INITIAL_PROGRESS_VALUE = 8;
const FINAL_PROGRESS_VALUE = 98;
const INCREMENTAL_PROGRESS_VALUE = 2; // in percent
const DEFAULT_TIMEOUT_VALUE = 100; // in ms

/**
 * @memberof Components
 *
 * @description
 * - A customizable progress bar component that increments its progress value over time.
 * - Default increment is 2 (i.e.2%) with interval of 100ms
 * - Initial progress value is 8% and will increment till 98%.
 *
 * @param {Object} props - The properties object.
 * @param {string} [props.text="Loading"] - The text displayed above the progress bar.
 * @param {string} [props.textClass=""] - The CSS class for styling the text.
 * @param {number} [props.timeoutValue=100] - The interval (in milliseconds) for progress updates.
 *
 * @returns {JSX.Element} The rendered progress bar component.
 */
const ProgressBar = (props) => {
	const { text, textClass, timeoutValue } = { ...props };

	// Initialize progress
	const [progress, setProgress] = useState(INITIAL_PROGRESS_VALUE);

	useEffect(() => {
		// Timer to manage the setTimeout
		let timer;
		if (progress < FINAL_PROGRESS_VALUE)
			timer = setTimeout(
				() => setProgress((prev) => prev + INCREMENTAL_PROGRESS_VALUE),
				timeoutValue || DEFAULT_TIMEOUT_VALUE,
			);

		// Cleanup function
		return () => clearTimeout(timer);
	}, [progress, timeoutValue]);

	return (
		<div className="w-full h-full flex flex-col justify-center items-center">
			<div className={textClass || ""}>{text || "Loading"}</div>
			<Progress value={progress} className="w-[60%]" />
		</div>
	);
};

export default ProgressBar;

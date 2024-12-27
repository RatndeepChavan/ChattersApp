import { useEffect, useState } from "react";

/**
 * @memberof Components
 *
 * @description
 * Timer component that show decremental time from a given start time value.
 *
 * @param {Object} props - The props object for the component.
 * @param {number} props.startTime - The initial time (in seconds) for the countdown timer.
 *
 * @returns {JSX.Element} A span element displaying the formatted countdown timer.
 */
const Timer = (props) => {
	const { startTime } = { ...props };
	const [timer, setTimer] = useState(startTime);

	useEffect(() => {
		// Setting an interval to decrement timer every second
		const timerInterval = setInterval(() => {
			setTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : 0));
		}, 1000);

		// Clear the interval on component unmount
		return () => clearInterval(timerInterval);
	}, []);

	// Function that accepts seconds(type:number) and convert it to MM:SS string format.
	const formatTime = (seconds) => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
			.toString()
			.padStart(2, "0")}`;
	};

	// Render the formatted time string as a span element
	return <span>{formatTime(timer)}</span>;
};

export default Timer;

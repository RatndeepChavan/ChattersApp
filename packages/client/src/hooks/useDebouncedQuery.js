import { useRef, useEffect } from "react";

/**
 * @memberof Hooks
 *
 * @function useDebouncedQuery
 *
 * @description
 * - Custom hook to create a debounced version of a callback function.
 * - IT delays the execution of the callback function for specified delay.
 *
 * @param {Function} callback - The function to debounce.
 * @param {number} delay - The delay in milliseconds for debouncing.
 *
 * @returns {Function} - A debounced version of the provided callback function.
 */
export const useDebouncedQuery = (callback, delay) => {
	// Ref to store the timeout ID
	const debounceRef = useRef(null);

	// Debounced function that clears existing timeout and sets a new one.
	const debouncedQuery = (...args) => {
		// Clear previously set timeout
		if (debounceRef.current) {
			clearTimeout(debounceRef.current);
		}

		// Set new timeout to execute callback after delay
		debounceRef.current = setTimeout(() => {
			callback(...args);
		}, delay);
	};

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}
		};
	}, []);

	return debouncedQuery;
};

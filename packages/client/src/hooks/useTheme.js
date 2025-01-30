import { useContext } from "react";
import { ThemeProviderContext } from "@/context/ThemeProvider";

/**
 * @memberof Hooks
 *
 * @function useTheme
 *
 * @description
 * - Custom hook to access the theme context.
 * - This hook provides the current theme and a function to update it.
 *
 * @returns {{theme: string, setTheme: function }} The theme context value, containing the current theme and a function to update it.
 *
 */
export const useTheme = () => {
	// Access the ThemeProviderContext
	const context = useContext(ThemeProviderContext);

	if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider");

	// Return context with theme data and update function.
	return context;
};

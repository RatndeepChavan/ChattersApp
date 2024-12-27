import { createContext, useEffect, useState } from "react";

// Initial state for the ThemeProviderContext.
const initialState = {
	theme: "light",
	setTheme: () => null,
};

// Creating a Context for the theme.
export const ThemeProviderContext = createContext(initialState);

/**
 * @memberof Context
 *
 * @function ThemeProvider
 *
 * @description
 * - ThemeProvider component that manages the application theme state
 * - It applies theme class to document's root element.
 * - Uses local state to keep the theme persistent on reload
 *
 * @param {object} props - The properties for ThemeProvider component.
 * @param {React.ReactNode} props.children - The children components wrapped by ThemeProvider.
 * @param {string} [props.defaultTheme="light"] - The default theme to be used initially.
 * @param {string} [props.storageKey="vite-ui-theme"] - The key for storing theme in localStorage.
 *
 * @returns {JSX.Element} ThemeProvider - ThemeProvider with theme state and default theme.
 */

export const ThemeProvider = ({
	/* eslint-disable */
	children,
	defaultTheme = "light",
	storageKey = "vite-ui-theme",
	...props
	/* eslint-enable */
}) => {
	// State to manage the current theme
	const [theme, setTheme] = useState(() => localStorage.getItem(storageKey) || defaultTheme);

	// Apply theme as a class on the document's root element
	useEffect(() => {
		const root = window.document.documentElement;

		// Remove any existing theme classes to avoid conflicts.
		root.classList.remove("light", "dark");

		// Apply the current theme as a class.
		root.classList.add(theme);
	}, [theme]);

	// Context value with the theme and a function to update it.
	const value = {
		theme,
		setTheme: (theme) => {
			// Save theme in localStorage for persistence across page reloads.
			localStorage.setItem(storageKey, theme);
			setTheme(theme);
		},
	};

	// Providing the theme context value to the child components.
	return (
		<ThemeProviderContext.Provider {...props} value={value}>
			{children}
		</ThemeProviderContext.Provider>
	);
};

// add inline and jsdoc comments

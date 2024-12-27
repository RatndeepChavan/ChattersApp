import { RouterProvider, Navigate, createBrowserRouter } from "react-router-dom";
import Auth from "@/pages/auth";
import Chat from "@/pages/chat";
import Profile from "@/pages/profile";
import { useUserStore } from "@/store";
import { ThemeProvider } from "@/context/ThemeProvider";

/**
 * @memberof Providers
 *
 * @description
 * Custom RouterProvider that accepts children and provides the router context.
 *
 * @param {Object} props - The component's props.
 * @param {JSX.Element} props.children - The children components wrapped by the provider.
 * @returns {JSX.Element} The provider rendering the children.
 */

//eslint-disable-next-line
const CustomRouterProvider = ({ children }) => {
	const { userInfo } = useUserStore();

	const router = createBrowserRouter([
		{
			path: "*",
			element: <Navigate to="/auth" />,
		},
		{
			path: "/auth",
			element: userInfo ? <Navigate to="/chat" /> : <Auth />,
		},
		{
			path: "/profile",
			element: userInfo ? <Profile /> : <Navigate to="/auth" />,
		},
		{
			path: "/chat",
			element: userInfo?.profileSetup ? (
				<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
					<Chat />
				</ThemeProvider>
			) : (
				<Navigate to="/profile" />
			),
		},
	]);

	return <RouterProvider router={router}>{children}</RouterProvider>;
};

export default CustomRouterProvider;

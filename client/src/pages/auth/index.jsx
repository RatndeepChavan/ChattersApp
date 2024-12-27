import { useQuery } from "@tanstack/react-query";
import { useProfileStore, useUserStore } from "@/store";
import apiClient from "@/lib/api-client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Victory from "@/assets/victory.svg";
import LogInForm from "./components/LogInForm";
import SignUpForm from "./components/SignUpForm";
import { GET_USER_INFO_ROUTE } from "@/utils/constants";
import { useEffect } from "react";
import NetworkError from "@/pages/error/NetworkError";
import ProgressBar from "@/components/ProgressBar";

/**
 * @namespace Pages.auth
 */

/**
 * @memberof Pages.auth
 *
 * @description
 * The `Auth` component is responsible for handling user authentication, displaying
 * A welcome page with options to either log in or sign up. It uses Zustand for
 * State management and React Query along with axios to fetch user data.
 *
 * The component:
 * - Pending : Progress bar component while fetching user data via api
 * - Error : Network error component if sever connection fails
 * - Main Component : `shadcn/ui` Tabs component interface for login and sign-up forms.
 *
 * Hooks:
 * - `useUserStore`: Zustand store hook for managing user-related information.
 * - `useProfileStore`: Zustand store hook for managing profile IDs of profile page.
 * - `useQuery`: React Query hook to fetch user data from an API.
 * - `useEffect`: React hook to update Zustand stores with fetched user data.
 *
 * @returns {JSX.Element} Returns the rendered authentication page.
 *
 * @example
 * // Usage
 * import Auth from './auth';
 *
 * function App() {
 *   return <Auth />;
 * }
 */
const Auth = () => {
	const { userInfo, setUserInfo } = useUserStore();
	const { setProfileId } = useProfileStore();

	// Query function to fetch user data
	const fetchUserData = async () => {
		const response = await apiClient.get(GET_USER_INFO_ROUTE);
		return response.data.data || null;
	};

	// Fetching data with react query
	const { data, isPending, isError, error } = useQuery({
		queryKey: ["userData"],
		queryFn: fetchUserData,
		enabled: !userInfo,
	});

	// Setting necessary data in zustand store
	// ! Need to user persistance store as else every reload will make api call
	useEffect(() => {
		if (data) {
			setUserInfo(data);
			setProfileId(data["_id"]);
		}
	}, [data, setProfileId, setUserInfo]);

	// * Error component (network error)
	if (isError) {
		const { status } = error;
		if (!status) {
			return <NetworkError />;
		}
	}

	// * Loading component
	if (isPending) {
		return (
			<div className="h-screen w-screen flex items-center justify-center">
				<ProgressBar
					text="Initializing App..."
					textClass="mb-5 font-2xl font-bold"
					timeoutValue={200}
				/>
			</div>
		);
	}

	// *COMPONENT TO RENDER LOGIN AND SIGN-UP FORM
	return (
		<div className={`h-screen w-screen flex items-center justify-center`}>
			<div className="h-[90%] border-2 border-info text-opacity-90 shadow-2xl w-4/5 md:w-[90vw] lg:w-[70vw] xl:w-[60vw] rounded-3xl">
				<div className="h-full w-[80%] mx-auto">
					{/* ----------------------------------------------------------
						*Header section
						---------------------------------------------------------- */}

					<div>
						<div className="flex justify-center items-center">
							<h1 className="text-5xl font-bold">Welcome</h1>
							<img
								src={Victory}
								alt="Victory Emoji"
								className="h-[70px]"
								loading="lazy"
							/>
						</div>
						<p className="font-bold text-center">Fill the details to start the chat!</p>
					</div>

					{/* ----------------------------------------------------------
						*Tab Section
						---------------------------------------------------------- */}

					<div className="flex justify-center mt-[2%]">
						<Tabs defaultValue="logIn" className="w-full">
							{/* ----------------------------------------------------------
								*Tab Headers
								---------------------------------------------------------- */}

							<TabsList className="w-full bg-transparent rounded-none justify-evenly">
								<TabsTrigger
									className="w-1/2 data-[state=active]:border-b-black data-[state=active]:border-b-2 data-[state=active]:font-bold data-[state=active]:border-white"
									value="logIn"
								>
									Login
								</TabsTrigger>

								<TabsTrigger
									className="w-1/2 data-[state=active]:border-b-black data-[state=active]:border-b-2 data-[state=active]:border-white"
									value="signUp"
								>
									Sign Up
								</TabsTrigger>
							</TabsList>

							{/* ----------------------------------------------------------
								*Tab Content
								---------------------------------------------------------- */}
							<TabsContent value="logIn" className="mt-8">
								<LogInForm />
							</TabsContent>
							<TabsContent value="signUp" className="mt-8">
								<SignUpForm />
							</TabsContent>
						</Tabs>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Auth;

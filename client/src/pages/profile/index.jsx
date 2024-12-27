import { useProfileStore, useUserStore } from "@/store";
import { useEffect, useState } from "react";
import ArrowBackLeft from "@/components/ArrowBackLeft";
import { Link, useNavigate } from "react-router-dom";
import { toastNotification } from "@/utils/helpers";
import { apiClient } from "@/lib/api-client";
import { FETCH_PROFILE } from "@/utils/constants";
import { useQuery } from "@tanstack/react-query";
import ProfilePageSkeleton from "./components/ProfilePageSkeleton";
import DetailsForm from "./components/DetailsForm";
import ProfileImage from "./components/ProfileImage";

/**
 * @namespace Pages.profile
 */

/**
 * @memberof Pages.profile
 *
 * @description
 * Profile component that displays and allows editing of the user's profile.
 * Also it displays other user profile too without edit option
 * Uses React Query along with axios to fetch profile data, with Zustand state management
 * and navigation for a seamless user experience.
 *
 * The component:
 * - Pending : Profile page skeleton component.
 * - Error : Toast notification with error specific message and if credential expired then auth page.
 * - Main Component : Profile page to display profile details
 *
 * Hooks:
 * - `useUserStore`: Zustand store hook for managing user-related information.
 * - `useProfileStore`: Zustand store hook for managing profile IDs of profile page.
 * - `useState`: Reach hook to store profile data.
 * - `useQuery`: React Query hook to fetch profile data from an API.
 * - `useEffect`: React hook to update profile data.
 *
 * @returns {JSX.Element} Returns the rendered authentication page.
 *
 * @example
 * // Usage
 * import Profile from './profile';
 *
 * function App() {
 *   return <Profile />;
 * }
 */

const Profile = () => {
	const { userInfo } = useUserStore();
	const { profileId, setProfileId } = useProfileStore();
	const [profileData, setProfileData] = useState(undefined);

	// * Using state lifting up technique
	// ? here we wanna render and update image from ProfileImage component but we'll submit it to DetailsForm component
	// ? to make api call. Therefore to share the image between this two component we are using this technique.
	// ! Very simple use case so no need to use any state management library
	const [image, setImage] = useState(userInfo.image);
	const navigate = useNavigate();

	// Function that handles back button logic
	const handleBack = () => {
		if (userInfo.profileSetup) {
			setProfileId(userInfo["_id"]);
			navigate("/chat");
		} else toastNotification("info", "Please complete your profile");
	};

	//  Function to fetch profile data
	const fetchProfileData = async () => {
		const response = await apiClient.post(FETCH_PROFILE, { profileId: profileId });
		return response.data.data;
	};

	// Fetching data with react query
	const { data, isLoading, isFetching } = useQuery({
		queryKey: ["profileData", profileId],
		queryFn: fetchProfileData,
		enabled: userInfo["_id"] !== profileId,
	});

	useEffect(() => {
		if (data) {
			setProfileData(data);
		}
	}, [data]);

	// Loading or fetching state ui
	if (isLoading && isFetching) {
		return (
			<div className="h-screen w-screen border border-2 border-red">
				<ProfilePageSkeleton />
			</div>
		);
	}

	return (
		<div className="h-screen w-screen flex flex-col items-center justify-center">
			<div className="w-[70%] h-[80%] relative">
				{/* ----------------------------------------------------------
					* Back to chat Button
					---------------------------------------------------------- */}
				<Link className="absolute w-[40px] h-[40px]" onClick={handleBack}>
					<ArrowBackLeft />
				</Link>

				<div className="w-full h-[80%] md:flex items-center justify-center">
					{/* ----------------------------------------------------------
						* Profile Image
						---------------------------------------------------------- */}
					<div
						className={`w-full md:w-[40%] h-[60%] md:h-full flex items-center justify-center ${
							profileData ? "pointer-events-none" : ""
						}`}
					>
						<ProfileImage
							image={profileData ? profileData.image : image}
							setImage={setImage}
						/>
					</div>
					{/* ----------------------------------------------------------
						* Form Section
						---------------------------------------------------------- */}

					<div className="w-full md:w-[60%] h-[40%] md:h-full flex justify-center items-center">
						{profileData ? (
							<div className="space-y-8 w-[90%]">
								<div className="rounded-full">{profileData.username}</div>
								<div className="rounded-full">{profileData.status}</div>
							</div>
						) : (
							<DetailsForm image={image} />
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Profile;

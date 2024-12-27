import { Skeleton } from "@/components/ui/skeleton";

/**
 * @memberof Pages.profile.components
 *
 * @description
 * - A skeleton loader for the profile page.
 * - Renders a circular skeleton placeholder for the profile image
 * - Renders three rounded rectangles for loading profile details.
 *
 * @returns {JSX.Element} Skeleton layout for profile page loading state.
 */
const ProfilePageSkeleton = () => {
	return (
		<>
			<div className="w-full h-[80%] md:flex items-center justify-center">
				{/* Profile Image Skeleton */}
				<div
					className={`w-full md:w-[40%] h-[60%] md:h-full flex items-center justify-center`}
				>
					<Skeleton className="w-[200px] h-[200px] rounded-full" />
				</div>

				{/* Profile Details Skeleton */}
				<div className="w-full md:w-[60%] h-[40%] md:h-full flex justify-center items-center">
					<div className="space-y-4 w-[50%]">
						<Skeleton className="rounded-full h-10" />
						<Skeleton className="rounded-full h-10" />
						<Skeleton className="rounded-full h-10" />
					</div>
				</div>
			</div>
		</>
	);
};

export default ProfilePageSkeleton;

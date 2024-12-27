import { Skeleton } from "@/components/ui/skeleton";

/**
 * @memberof Components.Skeletons
 *
 * @description
 * - Skeleton loader for a profile card component.
 * - This component serves as a placeholder during data loading,
 * - It mimics the structure of the actual profile card with loading animations.
 *
 * @returns {JSX.Element} The skeleton loader for the profile card.
 */
const ProfileCardSkeleton = () => {
	return (
		<div className="w-full h-[15%] flex ps-5 gap-3 items-center mt-2">
			<Skeleton className="w-[50px] h-[50px] rounded-full" />
			<div className="flex flex-col gap-1">
				<Skeleton className="h-4 w-[250px]" />
				<Skeleton className="h-4 w-[200px]" />
			</div>
		</div>
	);
};

export default ProfileCardSkeleton;

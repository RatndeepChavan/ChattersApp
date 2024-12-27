import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft } from "lucide-react";

/**
 * @memberof Components
 *
 * @description
 * - Renders a component with a left arrow fallback.
 * - Primarily used as a back button or navigation icon.
 *
 * @returns {JSX.Element} Component with a fallback arrow icon.
 */
const ArrowBackLeft = () => {
	return (
		<Avatar className="w-full h-full  cursor-pointer border-2 border-black dark:border-white hover:opacity-[60%]">
			<AvatarImage src="" alt="image" />
			<AvatarFallback className="border-none">
				<ArrowLeft className="w-full h-full" />
			</AvatarFallback>
		</Avatar>
	);
};

export default ArrowBackLeft;

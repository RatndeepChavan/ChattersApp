import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

/**
 * @memberof Components
 *
 * @description
 * ProfileCard Component shows the brief details of user.
 *
 * @param {Object} props - Component props.
 * @param {string} [props.image = ""] - URL of the profile image. Defaults to an empty string if not provided.
 * @param {string} [props.title = "User name"] - Title or name to display. Defaults to "User name" if not provided.
 * @param {string} [props.description = "Available"] - Description or status to display. Defaults to "Available" if not provided.
 *
 * @returns {JSX.Element} The rendered ProfileCard component.
 */
const ProfileCard = (props) => {
	// Destructure the props
	const { image, title, description } = { ...props };

	return (
		<div className="w-full h-[15%] flex gap-3 items-center cursor-pointer">
			<div className="w-[50px] h-[50px]">
				<Avatar className="w-full h-full border-gray-300 border-2" title="view profile">
					<AvatarImage src={image || ""} alt="image" />
					<AvatarFallback>USER</AvatarFallback>
				</Avatar>
			</div>
			<div className="flex flex-col">
				<b className="uppercase">{title || "User name"}</b>
				<i>{description || "Available"}</i>
			</div>
		</div>
	);
};

export default ProfileCard;

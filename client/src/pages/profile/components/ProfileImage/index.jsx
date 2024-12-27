import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useRef } from "react";

// Define allowed file types in a separate array for readability
const ALLOWED_FILE_TYPE = ["image/png", "image/jpeg"];

/**
 * @memberof Pages.profile.components
 *
 * @description
 * - Renders an avatar that displays a user's profile image and allows image uploads.
 * - If an image is uploaded, it converts it to a base64 string and updates the display.
 *
 * @param {Object} props - Component props.
 * @param {string} props.image - Base64 string of the user's profile image.
 * @param {Function} props.setImage - Function to set the profile image as a base64 string.
 *
 * @returns {JSX.Element} Profile image avatar with upload functionality.
 */
const ProfileImage = (props) => {
	const inputRef = useRef();
	const { image, setImage } = { ...props };

	// Function to triggers the file input dialog.
	const handleClick = () => inputRef.current.click();

	// Handles the file upload event, converts the selected image to a base64 string, and updates the displayed image.
	// ? In current project we are not using any external storage (like S3 bucket)
	// ? so directly saving base64 string in database to fulfill the requirements
	const handleChange = (event) => {
		const file = event.target.files[0];

		if (file) {
			// Check for supported image types
			if (ALLOWED_FILE_TYPE.includes(file.type)) {
				// Convert file to base64
				const reader = new FileReader();
				reader.onloadend = () => {
					const encodedData = reader.result;
					setImage(encodedData);
				};
				reader.readAsDataURL(file);
			} else {
				alert("Only JPG and PNG files are allowed.");
			}
		}
	};

	return (
		<div className="w-[200px] h-[200px] rounded-full cursor-pointer">
			{/* ----------------------------------------------------------
				* Image input 
				---------------------------------------------------------- */}
			<input
				type="file"
				className="hidden"
				ref={inputRef}
				onChange={handleChange}
				accept=".png, .jpg,. jpeg"
			/>

			{/* ----------------------------------------------------------
				* Avatar
				---------------------------------------------------------- */}
			<Avatar className="w-full h-full" onClick={handleClick}>
				<AvatarImage src={image ? image : ""} alt="image" />
				<AvatarFallback>USER</AvatarFallback>
			</Avatar>
		</div>
	);
};

export default ProfileImage;

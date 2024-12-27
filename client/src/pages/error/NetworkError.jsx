import { ASSETS_URL } from "@/utils/constants";

const NetworkError = () => {
	return (
		<div className="w-screen h-screen">
			<img
				className="w-full h-full"
				src={`${ASSETS_URL}Network Error.jpg`}
				alt="Network Error"
			/>
		</div>
	);
};

export default NetworkError;

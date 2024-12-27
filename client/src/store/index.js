import { create } from "zustand";
import { createUserSlice } from "./slices/userSlice";
import { createProfileSlice } from "./slices/profileSlice";
import { createCurrentChatSlice } from "./slices/chatSlice";

export const useUserStore = create((...a) => ({
	...createUserSlice(...a),
}));

export const useProfileStore = create((...a) => ({
	...createProfileSlice(...a),
}));

export const useCurrentChatStore = create((...a) => ({
	...createCurrentChatSlice(...a),
}));

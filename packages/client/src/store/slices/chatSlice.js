export const createCurrentChatSlice = (set) => ({
	currentChat: undefined,
	setCurrentChat: (currentChat) => set({ currentChat }),
});

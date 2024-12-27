export const createUserSlice = (set) => ({
	userInfo: undefined,
	setUserInfo: (data) => set({ userInfo: data }),
});

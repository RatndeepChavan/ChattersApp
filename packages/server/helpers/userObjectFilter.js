/**
 * @memberof helpers
 *
 * @function userObjectFilter
 *
 * @description
 * Function to Filtering user details to avoid sending sensitive data.
 *
 * @param {Object} userObject - An Object fetch from db having all user related data.
 * @returns {Object} An object with filtered data.
 */
export const userObjectFilter = (userObject) => {
	// Filtering user details to avoid sending sensitive data
	const { email, mobile, password, createdAt, updatedAt, ...filteredData } = userObject;
	return filteredData;
};

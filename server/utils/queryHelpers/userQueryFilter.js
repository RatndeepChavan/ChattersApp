/**
 * @memberof utils.QueryHelpers
 *
 * @function userGetQueryFilter
 *
 * @description
 * MongoDB query filter to get user data based on provided credential.
 *
 * @param {string} emailOrMobile - The input string, expected to be either an email address or a mobile number.
 * @returns {Object} A query filter object, with either an `email` or `mobile` as key.
 */
export const userGetQueryFilter = (emailOrMobile) => {
	if (emailOrMobile.includes("@")) {
		return { email: emailOrMobile };
	} else {
		return { mobile: emailOrMobile };
	}
};

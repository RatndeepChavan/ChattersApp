// Set up environment
export const ENV = import.meta.env.VITE_ENV;

// Set website host url
export const DEVELOPMENT_URL = import.meta.env.VITE_DEVELOPMENT_SERVER;
export const PRODUCTION_URL = import.meta.env.VITE_PRODUCTION_SERVER;
export const HOST = ENV === "production" ? PRODUCTION_URL : DEVELOPMENT_URL;

// set assets url for media files
export const ASSETS_URL = ENV === "production" ? "src/assets/" : "";

// Set up notification alive time
export const TOAST_NOTIFICATION_DURATION = import.meta.env.VITE_TOAST_NOTIFICATION_DURATION;

// * Initial route
export const VERSION_ROUTE = "/api/v1";

// * Main routes
export const AUTH_ROUTES = `${VERSION_ROUTE}/auth`;
export const USER_ROUTES = `${VERSION_ROUTE}/user`;
export const CHATS_ROUTES = `${VERSION_ROUTE}/chats`;
export const MESSAGE_ROUTES = `${VERSION_ROUTE}/message`;

// * Sub routes
// auth routes
export const SIGNUP_ROUTE = `${AUTH_ROUTES}/signup`;
export const LOGIN_ROUTE = `${AUTH_ROUTES}/login`;
export const GET_OTP_ROUTE = `${AUTH_ROUTES}/get-otp`;
export const VALIDATE_OTP_ROUTE = `${AUTH_ROUTES}/otp-validation`;
export const LOGOUT_ROUTE = `${AUTH_ROUTES}/logout`;
export const REFRESH_TOKEN_ROUTE = `${AUTH_ROUTES}/refresh-token`;

// user routes
export const GET_USER_INFO_ROUTE = `${USER_ROUTES}/user-info`;
export const UPDATE_USER_ROUTE = `${USER_ROUTES}/update-user-details`;
export const GET_USERS = `${USER_ROUTES}/get-users`;
export const FETCH_PROFILE = `${USER_ROUTES}/profile-info`;

// chat routes
export const SEND_REQUEST = `${CHATS_ROUTES}/send-request`;
export const FETCH_NOTIFICATIONS = `${CHATS_ROUTES}/get-notifications`;
export const REQUEST_FEEDBACK = `${CHATS_ROUTES}/request-feedback`;
export const DELETE_NOTIFICATION = `${CHATS_ROUTES}/delete-notification`;
export const GET_CHATS = `${CHATS_ROUTES}/get-chats`;

// message routes
export const FETCH_MESSAGES = `${MESSAGE_ROUTES}/get-conversation`;
export const UPDATE_MESSAGES = `${MESSAGE_ROUTES}/update-conversation`;
export const UPDATE_READ_STATE = `${MESSAGE_ROUTES}/update-read-state`;

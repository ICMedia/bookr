import GlobalConstants from "./GlobalConstants";

const AUTH_RECEIVE_USERINFO = 'AUTH_RECEIVE_USERINFO';
const AUTH_RECEIVE_TOKEN = 'AUTH_RECEIVE_TOKEN';

const AUTH_ERR_LOGIN = 'AUTH_ERR_LOGIN';

const JWT_REFRESH_INTERVAL = GlobalConstants.IS_DEBUG ? (10 * GlobalConstants.SECONDS) : (1 * GlobalConstants.MINUTES);

export default {AUTH_RECEIVE_USERINFO, AUTH_RECEIVE_TOKEN, AUTH_ERR_LOGIN, JWT_REFRESH_INTERVAL};

import AppDispatcher from '../dispatcher/AppDispatcher';
import AuthConstants from '../constants/AuthConstants';
import AuthActions from "../actions/AuthActions";
import BaseStore from "./BaseStore";

let jwtRefreshTimer;

if (__CLIENT__) {
	jwtRefreshTimer = setInterval(() => {
		AuthActions.refreshToken(getToken())
	}, AuthConstants.JWT_REFRESH_INTERVAL);
}

let userCache = {loggedIn: false};

let loginErrors = [];

let setToken = (token) => {
	if (__CLIENT__) {

		if (token) {
			localStorage.token = token;
		} else {
			delete localStorage.token;
		}
	}
};
let getToken = () => {
	if (__SERVER__) {
		return null;
	}

	return localStorage.token;
};

class AuthStore extends BaseStore {
	constructor() {
		super();

		if (getToken()) {
			AuthActions.loginViaToken(getToken());
		}
	}

	getUserInfo() {
		return userCache;
	}

	getLoginErrors() {
		return loginErrors;
	}

	makeAuthHeader() {
		if (!getToken()) {
			return '';
		}

		return `JWT ${getToken()}`
	}
}

const AUTH_STORE = new AuthStore();
export default AUTH_STORE;

AppDispatcher.register((action) => {
	switch (action.actionType) {
		case AuthConstants.AUTH_RECEIVE_USERINFO:
			userCache = action.userInfo;
			AUTH_STORE.emitChange();
			break;
		case AuthConstants.AUTH_RECEIVE_TOKEN:
			setToken(action.token);
			AUTH_STORE.emitChange();
			break;
		case AuthConstants.AUTH_ERR_LOGIN:
			loginErrors = action.errors;
			AUTH_STORE.emitChange();
			break;
		default:
			// no op
	}
});

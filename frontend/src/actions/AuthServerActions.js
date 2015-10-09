import AuthConstants from '../constants/AuthConstants';
import AppDispatcher from '../dispatcher/AppDispatcher';

class AuthServerActions {
	receiveToken(token) {
		AppDispatcher.dispatch({
			actionType: AuthConstants.AUTH_RECEIVE_TOKEN,
			token: token
		});
	}

	receiveUserInfo(userInfo) {
		AppDispatcher.dispatch({
			actionType: AuthConstants.AUTH_RECEIVE_USERINFO,
			userInfo: userInfo
		});
	}

	receiveLoginErrors(loginErrors) {
		AppDispatcher.dispatch({
			actionType: AuthConstants.AUTH_ERR_LOGIN,
			errors: loginErrors
		});
	}
}

export default new AuthServerActions();

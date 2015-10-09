import AuthAPI from "../utils/AuthAPI";

class AuthActions {
	login(username, password) {
		AuthAPI.login(username, password);
	}

	logout() {
		AuthAPI.logout();
	}

	loginViaToken(token) {
		AuthAPI.loginWithToken(token);
	}

	refreshToken(oldToken) {
		AuthAPI.refreshToken(oldToken);
	}
}

export default new AuthActions();

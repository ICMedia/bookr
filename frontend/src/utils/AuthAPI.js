import __fetch from "isomorphic-fetch";
import Promise from 'bluebird';

import { API, ResponseError } from "./api_info";
import AuthServerActions from "../actions/AuthServerActions";

const NOT_LOGGED_IN_USER = {
	loggedIn: false
};

class AuthAPI {
	login(username, password) {
		console.log("Attempting login with passed credentials...");
		return API.fetchJson('/auth/token/', {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				username: username,
				password: password
			})
		}).then((tokenInfo) => {
			console.log('Login successful! Token is', tokenInfo.token);
			this.setToken(tokenInfo.token);
			this.refreshUserInfo(tokenInfo.token);
		}).catch((err) => {
			console.error("Error logging in", err);
			if (err instanceof ResponseError && err.response.status === 400) {
				err.response.json().then((responseObj) => {
					if (responseObj.non_field_errors) {
						AuthServerActions.receiveLoginErrors(responseObj.non_field_errors);
					} else {
						AuthServerActions.receiveLoginErrors(["Unknown error - sorry! Try again later?"]);
					}
				}).catch((err) => {
					AuthServerActions.receiveLoginErrors(["Bad response from server - try again later?"]);
				});
			} else {
				AuthServerActions.receiveLoginErrors([err.toString()]);
			}
		});
	}

	refreshToken(oldToken) {
		console.log("Refreshing token...");
		API.fetchJson('/auth/token/refresh/', {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'Authorization': `JWT ${oldToken}`
			},
			body: JSON.stringify({
				token: oldToken
			})
		}).then((tokenInfo) => {
			console.log("Refreshed! Token now", tokenInfo.token);
			this.setToken(tokenInfo.token);
		}).catch((err) => {
			console.error("Error refreshing token...?");
			if (err instanceof ResponseError && err.response.status === 400) {
				console.log("...and it's an actual 400, logging out.");
				this.logout();
			}
		});
	}

	loginWithToken(token) {
		console.log("Attempting login with token...");
		this.refreshUserInfo(token);
	}

	logout() {
		this.setToken(null);
		this.setUserInfo(NOT_LOGGED_IN_USER);
	}

	setToken(newToken) {
		try {
			AuthServerActions.receiveToken(newToken);
		} catch (ex) {
			console.error("Error in receiveToken", ex);
		}
	}

	setUserInfo(newUserInfo) {
		try {
			AuthServerActions.receiveUserInfo(newUserInfo);
		} catch (ex) {
			console.error("Error in receiveUserInfo", ex);
		}
	}

	refreshUserInfo(token) {
		API.fetchJson('/user/', {
			method: 'GET',
			headers: {
				'Authorization': API.makeAuthHeader(token),
				'Accept': 'application/json'
			}
		}).then((userInfo) => {
			this.setUserInfo(userInfo);
		}).catch((err) => {
			console.error("Error fetching user info, logging out!", err, err.stack);
			this.logout();
		});
	}
}

export default new AuthAPI();

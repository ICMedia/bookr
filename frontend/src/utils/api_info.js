import __fetch from "isomorphic-fetch";
import Promise from 'bluebird';

import { IS_DEBUG } from "../constants/GlobalConstants";

export class API {
	static path(resource) {
		if (__CLIENT__) {
			const {hostname, port} = window.location;
			return `http://${hostname}:${port}/api${resource}`;
		} else if (__SERVER__) {
			return `http://localhost:8111/api${resource}`;
		} else {
			throw new Error("neither client nor server?!?");
		}
	}

	static makeAuthHeader(token) {
		return `JWT ${token}`;
	}

	static jsonResponse(promise) {
		return promise.then((response) => {
			if (response.status >= 400) {
				throw new ResponseError(response, "Bad response from server");
			}

			return response.json();
		})
	}

	static fetchJson(apiPath, params) {
		return API.jsonResponse(fetch(API.path(apiPath), params));
	}

	static fetchJsonPage(apiPath, params) {
		return API.fetchJson(apiPath, params).then((pageResp) => {
			let results = pageResp.results.slice();
			results.meta = {
				count: pageResp.count,
				next: pageResp.next,
				previous: pageResp.previous
			};
			return results;
		});
	}

	static fetchAllJsonPages(apiPath, qdata, params, gotDataCallback) {
		if (!qdata) {
			qdata = {};
		}

		let resultsSoFar = [];
		let getPage = (currentPage=1) => {
			let myqdata = Object.assign({}, qdata);
			myqdata.page = currentPage;

			return API.fetchJsonPage(apiPath + API.toQueryString(myqdata), params).then((results) => {
				resultsSoFar = resultsSoFar.concat(results);

				const complete = !results.meta.next;
				gotDataCallback(resultsSoFar, complete);

				return results;
			}).then((results) => {
				if (results.meta.next) {
					return getPage(currentPage+1);
				}
				return resultsSoFar;
			});
		};

		return getPage();
	}

	static toQueryString(params) {
		var qs = '?';

		if (!params) {
			return '';
		}

		let keys = Object.keys(params);
		keys.sort();

		for (let key of keys) {
			if (params[key] === null || params[key] === undefined) {
				continue;
			}

			qs += encodeURIComponent(key) + '=' + encodeURIComponent(params[key]) + '&';
		}
		return qs.slice(0, qs.length-1);
	}
}

export class ResponseError extends Error {
	constructor(response, err) {
		super(err);
		this.response = response;
	}
}

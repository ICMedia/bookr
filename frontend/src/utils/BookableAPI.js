import __fetch from "isomorphic-fetch";
import Promise from 'bluebird';

import { API, ResponseError } from "./api_info";
import BookableServerActions from "../actions/BookableServerActions";

class BookableAPI {
	list(page=1, qdata=null) {
		if (!qdata) {
			qdata = {};
		}

		qdata.page = page;
		let qs = API.toQueryString(qdata);

		return API.fetchJsonPage(`/bookings/bookables/${qs}`, {
			method: 'GET',
			headers: {
				'Accept': 'application/json'
			}
		});
	}

	listAll(qdata) {
		return API.fetchAllJsonPages(`/bookings/bookables/`, qdata, {
			method: 'GET',
			headers: {
				'Accept': 'application/json'
			}
		}, (results) => {
			BookableServerActions.receiveBookablesForQuery(qdata, results);
		});
	}

	getById(id) {
		return API.fetchJson(`/bookings/bookables/${id}/`, {
			method: 'GET',
			headers: {
				'Accept': 'application/json'
			}
		}).then((bookable) => {
			BookableServerActions.receiveBookable(bookable);
		});
	}
}

export default new BookableAPI();

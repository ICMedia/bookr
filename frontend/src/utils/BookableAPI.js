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

		return API.fetchJsonPage(`/bookings/bookables/${qs}`);
	}

	listAll(qdata) {
		return API.fetchAllJsonPages(`/bookings/bookables/`, qdata, {}, (results) => {
			BookableServerActions.receiveBookablesForQuery(qdata, results);
		});
	}

	getById(id) {
		return API.fetchJson(`/bookings/bookables/${id}/`).then((bookable) => {
			BookableServerActions.receiveBookable(bookable);
		});
	}
}

export default new BookableAPI();

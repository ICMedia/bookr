import __fetch from "isomorphic-fetch";
import Promise from 'bluebird';

import { API, ResponseError } from "./api_info";
import BookingServerActions from "../actions/BookingServerActions";
import AuthStore from "../stores/AuthStore";

class BookingAPI {
	list(page=1, qdata=null) {
		if (!qdata) {
			qdata = {};
		}

		qdata.page = page;
		let qs = API.toQueryString(qdata);

		return API.fetchJsonPage(`/bookings/bookings/${qs}`, {
			method: 'GET',
			headers: {
				'Accept': 'application/json',
				'Authorization': AuthStore.makeAuthHeader()
			}
		});
	}

	listAll(qdata) {
		return API.fetchAllJsonPages(`/bookings/bookings/`, qdata, {
			method: 'GET',
			headers: {
				'Accept': 'application/json',
				'Authorization': AuthStore.makeAuthHeader()
			}
		}, (results) => {
			BookingServerActions.receiveBookingsForQuery(qdata, results);
			return results;
		});
	}

	getById(id) {
		return API.fetchJson(`/bookings/bookings/${id}/`, {
			method: 'GET',
			headers: {
				'Accept': 'application/json',
				'Authorization': AuthStore.makeAuthHeader()
			}
		}).then((booking) => {
			BookingServerActions.receiveBooking(booking);
			return booking;
		});
	}

	create(booking) {
		return API.fetchJson(`/bookings/bookings/`, {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'Authorization': AuthStore.makeAuthHeader()
			},
			body: JSON.stringify(booking)
		}).then((resp) => {
			BookingServerActions.receiveBooking(resp);
			return resp;
		}).catch((err) => {
			if (err instanceof ResponseError && err.response.status === 400) {
				err.response.json().then((responseJson) => {
					BookingServerActions.receiveCreateErrors(responseJson);
				}, () => {
					BookingServerActions.receiveCreateErrors({
						non_field_errors: ['Something went wrong - try again later?']
					});
				});
			} else {
				BookingServerActions.receiveCreateErrors({
					non_field_errors: ['Something went wrong - try again later?']
				});
			}
			return null;
		});
	}

	destroy(bookingId) {
		return API.fetch(`/bookings/bookings/${bookingId}/`, {
			method: 'DELETE',
			headers: {
				'Accept': 'application/json',
				'Authorization': AuthStore.makeAuthHeader()
			}
		}).then((resp) => {
			BookingServerActions.receiveBookingDestroyed(bookingId);
		});

	}

	listAwaitingApproval() {
		if (!AuthStore.getUserInfo().loggedIn) return [];

		return this.listAll({'awaiting_approval_by': AuthStore.getUserInfo().username}).then((resp) => {
			BookingServerActions.receiveAwaitingApprovalRaw(resp);
		});
	}
}

export default new BookingAPI();

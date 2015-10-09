import __fetch from "isomorphic-fetch";
import Promise from 'bluebird';

import { API, ResponseError } from "./api_info";
import BookingPartServerActions from "../actions/BookingPartServerActions";
import AuthStore from "../stores/AuthStore";

class BookingPartAPI {
	list(page=1, qdata=null) {
		if (!qdata) {
			qdata = {};
		}

		qdata.page = page;
		let qs = API.toQueryString(qdata);

		return API.fetchJsonPage(`/bookings/booking-parts/${qs}`, {
			method: 'GET',
			headers: {
				'Accept': 'application/json'
			}
		});
	}

	listForBooking(bookingId, qdata) {
		return API.fetchAllJsonPages(`/bookings/bookings/${bookingId}/booking-parts/`, qdata, {
			method: 'GET',
			headers: {
				'Accept': 'application/json'
			}
		}, (results, complete) => {
			BookingPartServerActions.receiveBookingPartsForBooking(bookingId, qdata, results, complete);
		});
	}

	listForBookable(bookableId, qdata) {
		return API.fetchAllJsonPages(`/bookings/bookables/${bookableId}/booking-parts/`, qdata, {
			method: 'GET',
			headers: {
				'Accept': 'application/json'
			}
		}, (results, complete) => {
			BookingPartServerActions.receiveBookingPartsForBookable(bookableId, qdata, results, complete);
		});
	}

	getById(id) {
		return API.fetchJson(`/bookings/booking-parts/${id}/`, {
			method: 'GET',
			headers: {
				'Accept': 'application/json'
			}
		}).then((bookingpart) => {
			BookingPartServerActions.receiveBookingPart(bookingpart);
		});
	}

	transitionToStatus(id, status) {
		return API.fetchJson(`/bookings/booking-parts/${id}/`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'Authorization': AuthStore.makeAuthHeader()
			},
			body: JSON.stringify({
				'status': status
			})
		}).then((bookingpart) => {
			return this.getById(id);
		})
	}

	create(bookingPart) {
		return API.fetchJson(`/bookings/booking-parts/`, {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'Authorization': AuthStore.makeAuthHeader()
			},
			body: JSON.stringify(bookingPart)
		}).then((resp) => {
			return this.getById(resp.id);
		}, (err) => {
			if (err instanceof ResponseError && err.response.status === 400) {
				err.response.json().then((responseJson) => {
					BookingPartServerActions.receiveCreateErrors(responseJson);
				}, () => {
					BookingPartServerActions.receiveCreateErrors({
						non_field_errors: ['Something went wrong - try again later?']
					});
				});
			} else {
				BookingPartServerActions.receiveCreateErrors({
					non_field_errors: ['Something went wrong - try again later?']
				});
			}
		});
	}

	destroy(bookingPartId) {
		return API.fetchJson(`/bookings/booking-parts/${bookingPartId}/`, {
			method: 'DELETE',
			headers: {
				'Accept': 'application/json',
				'Authorization': AuthStore.makeAuthHeader()
			}
		}).then((resp) => {
			BookingPartServerActions.receiveBookingPartDestroyed(bookingPartId);
		});
	}
}

export default new BookingPartAPI();

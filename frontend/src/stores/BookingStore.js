import AppDispatcher from '../dispatcher/AppDispatcher';
import BookingConstants from '../constants/BookingConstants';
import BaseStore from "./BaseStore";

import { API } from "../utils/api_info";

let _bookings = {};
let _queryCache = {};

let _createErrors = {};

class BookingStore extends BaseStore {
	getById(id) {
		return _bookings[id];
	}

	listForQuery(query) {
		return _queryCache[API.toQueryString(query)].map((bookingId) => _bookings[bookingId]);
	}

	getCreateErrors() {
		return _createErrors;
	}
}

const BOOKING_STORE = new BookingStore();
export default BOOKING_STORE;

AppDispatcher.register((action) => {
	switch (action.actionType) {
		case BookingConstants.BOOKING_RECEIVE_BOOKING:
			_bookings[action.booking.id] = action.booking;
			BOOKING_STORE.emitChange();
			break;
		case BookingConstants.BOOKING_RECEIVE_BOOKINGS_FOR_QUERY:
			_bookings = Object.assign(_bookings, action.bookings);
			_queryCache[API.toQueryString(action.query)] = action.bookings.map((booking) => booking.id);
			BOOKING_STORE.emitChange();
			break;
		case BookingConstants.BOOKINGPART_RECEIVE_CREATE_ERRORS:
			_createErrors = action.errors;
			BOOKING_STORE.emitChange();
			break;
		default:
		// no op
	}
});



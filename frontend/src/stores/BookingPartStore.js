import AppDispatcher from '../dispatcher/AppDispatcher';
import BookingPartConstants from '../constants/BookingPartConstants';
import BaseStore from "./BaseStore";
import BookableStore from "./BookableStore";

import { API } from "../utils/api_info";

let _bookingParts = {};
let _bookingCache = {};
let _bookableCache = {};

let _createErrors = {};

class BookingPartStore extends BaseStore {
	getById(id) {
		return _bookingParts[id];
	}

	listForBooking(bookingId, qdata) {
		let qs = API.toQueryString(qdata);

		if (!_bookingCache[bookingId] || !_bookingCache[bookingId][qs]) return [];
		return _bookingCache[bookingId][qs].map((bookingPartId) => _bookingParts[bookingPartId]);
	}

	listForBookable(bookableId, qdata) {
		let qs = API.toQueryString(qdata);

		if (!_bookableCache[bookableId] || !_bookableCache[bookableId][qs]) return [];
		return _bookableCache[bookableId][qs].map((bookingPartId) => _bookingParts[bookingPartId]);
	}

	userCanApprove(id, username) {
		if (id.hasOwnProperty("id")) {
			id = id.id;
		}

		if (!username) return false;
		if (!_bookingParts[id]) return false;

		return BookableStore.userCanApproveFor(_bookingParts[id].bookable.id, username);
	}

	getCreateErrors() {
		return _createErrors;
	}

	hasConflicts(id) {
		if (!_bookingParts[id]) return true;
		return this.conflicts(id).filter((conflict) => conflict.type === 'hard').length > 0;
	}

	hasSoftConflicts(id) {
		if (!_bookingParts[id]) return true;
		return this.conflicts(id).filter((conflict) => conflict.type === 'soft').length > 0;
	}

	conflicts(id) {
		if (!_bookingParts[id]) return [];
		return _bookingParts[id].potential_overlaps.map((overlapPart) => {
			overlapPart = Object.assign({}, overlapPart);
			overlapPart.type = (overlapPart.status === 'approved' && overlapPart.booking.type !== 'warning') ? 'hard' : 'soft';
			return overlapPart;
		})
	}
}

const BOOKINGPART_STORE = new BookingPartStore();
export default BOOKINGPART_STORE;

let updateBookingParts = (bookingParts) => {
	bookingParts.map((bookingPart) => {
		_bookingParts[bookingPart.id] = bookingPart;
	});
};

AppDispatcher.register((action) => {
	let qs, cache, bid;

	switch (action.actionType) {
		case BookingPartConstants.BOOKINGPART_RECEIVE_BOOKINGPART:
			_bookingParts[action.bookingPart.id] = action.bookingPart;
			BOOKINGPART_STORE.emitChange();
			break;
		case BookingPartConstants.BOOKINGPART_RECEIVE_BOOKINGPARTS_FOR_BOOKABLE:
			qs = API.toQueryString(action.query);
			bid = action.bookableId;

			updateBookingParts(action.bookingParts);

			cache = _bookableCache;
			if (!cache[bid]) cache[bid] = {};
			if (!action.complete && cache[bid][qs] && cache[bid][qs].complete) break;
			cache[bid][qs] = action.bookingParts.map((bookingPart) => bookingPart.id);
			cache[bid][qs].complete = action.complete;

			BOOKINGPART_STORE.emitChange();
			break;
		case BookingPartConstants.BOOKINGPART_RECEIVE_BOOKINGPARTS_FOR_BOOKING:
			qs = API.toQueryString(action.query);
			bid = action.bookingId;

			updateBookingParts(action.bookingParts);

			cache = _bookingCache;
			if (!cache[bid]) cache[bid] = {};
			if (!action.complete && cache[bid][qs] && cache[bid][qs].complete) break;
			cache[bid][qs] = action.bookingParts.map((bookingPart) => bookingPart.id);
			cache[bid][qs].complete = action.complete;

			BOOKINGPART_STORE.emitChange();
			break;
		case BookingPartConstants.BOOKINGPART_RECEIVE_CREATE_ERRORS:
			_createErrors = action.errors;
			BOOKINGPART_STORE.emitChange();
			break;
		default:
		// no op
	}
});



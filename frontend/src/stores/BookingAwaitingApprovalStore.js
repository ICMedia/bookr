import AppDispatcher from '../dispatcher/AppDispatcher';
import BookingConstants from '../constants/BookingConstants';
import GlobalConstants from '../constants/GlobalConstants';
import BaseStore from "./BaseStore";

let _awaitingApproval = [];

class BookingAwaitingApprovalStore extends BaseStore {
	list() {
		return _awaitingApproval;
	}
}

const BOOKING_AWAITING_APPROVAL_STORE = new BookingAwaitingApprovalStore();
export default BOOKING_AWAITING_APPROVAL_STORE;

AppDispatcher.register((action) => {
	switch (action.actionType) {
		case BookingConstants.AWAITING_APPROVAL_RECEIVE_RAW:
			_awaitingApproval = action.bookings;
			BOOKING_AWAITING_APPROVAL_STORE.emitChange();
			break;
		default:
		// no op
	}
});



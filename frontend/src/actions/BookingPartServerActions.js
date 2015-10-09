import BookingPartConstants from '../constants/BookingPartConstants';
import AppDispatcher from '../dispatcher/AppDispatcher';

import BookableServerActions from "../actions/BookableServerActions";
import BookingServerActions from "../actions/BookingServerActions";

class BookingPartServerActions {

	receiveBookingPartsForBookable(bookableId, qdata, finalResults, complete) {
		AppDispatcher.dispatch({
			actionType: BookingPartConstants.BOOKINGPART_RECEIVE_BOOKINGPARTS_FOR_BOOKABLE,
			bookableId: bookableId,
			query: qdata,
			complete: complete,
			bookingParts: finalResults
		});
		finalResults.map((bookingpart) => {
			if (bookingpart.bookable) {
				BookableServerActions.receiveBookable(bookingpart.bookable);
			}
			if (bookingpart.booking) {
				BookingServerActions.receiveBooking(bookingpart.booking);
			}
		});
	}

	receiveBookingPartsForBooking(bookingId, qdata, finalResults, complete) {
		AppDispatcher.dispatch({
			actionType: BookingPartConstants.BOOKINGPART_RECEIVE_BOOKINGPARTS_FOR_BOOKING,
			bookingId: bookingId,
			query: qdata,
			complete: complete,
			bookingParts: finalResults
		});
		finalResults.map((bookingpart) => {
			if (bookingpart.bookable) {
				BookableServerActions.receiveBookable(bookingpart.bookable);
			}
			if (bookingpart.booking) {
				BookingServerActions.receiveBooking(bookingpart.booking);
			}
		});
	}

	receiveBookingPart(bookingPart) {
		AppDispatcher.dispatch({
			actionType: BookingPartConstants.BOOKINGPART_RECEIVE_BOOKINGPART,
			bookingPart: bookingPart
		});
		if (bookingPart.bookable) {
			BookableServerActions.receiveBookable(bookingPart.bookable);
		}
		if (bookingPart.booking) {
			BookingServerActions.receiveBooking(bookingPart.booking);
		}
	}

	receiveCreateErrors(errors) {
		AppDispatcher.dispatch({
			actionType: BookingPartConstants.BOOKINGPART_RECEIVE_CREATE_ERRORS,
			errors: errors
		})
	}

	receiveBookingPartDestroyed(bookingPartId) {
		AppDispatcher.dispatch({
			actionType: BookingPartConstants.BOOKINGPART_RECEIVE_BOOKINGPART_DESTROYED,
			bookingPartId: bookingPartId
		})
	}
}

export default new BookingPartServerActions();

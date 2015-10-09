import BookingConstants from '../constants/BookingConstants';
import AppDispatcher from '../dispatcher/AppDispatcher';

class BookingServerActions {

	receiveBookingsForQuery(qdata, finalResults) {
		AppDispatcher.dispatch({
			actionType: BookingConstants.BOOKING_RECEIVE_BOOKINGS_FOR_QUERY,
			query: qdata,
			bookings: finalResults
		});
	}

	receiveBooking(booking) {
		AppDispatcher.dispatch({
			actionType: BookingConstants.BOOKING_RECEIVE_BOOKING,
			booking: booking
		});
	}

	receiveCreateErrors(errors) {
		AppDispatcher.dispatch({
			actionType: BookingConstants.BOOKING_RECEIVE_CREATE_ERRORS,
			errors: errors
		})
	}

	receiveBookingDestroyed(bookingId) {
		AppDispatcher.dispatch({
			actionType: BookingConstants.BOOKING_RECEIVE_BOOKING_DESTROYED,
			bookingPartId: bookingId
		})
	}

	receiveAwaitingApprovalRaw(bookings) {
		AppDispatcher.dispatch({
			actionType: BookingConstants.AWAITING_APPROVAL_RECEIVE_RAW,
			bookings: bookings
		});
	}
}

export default new BookingServerActions();

import BookingPartAPI from "../utils/BookingPartAPI";

class BookingPartActions {

	getById(bookingId) {
		BookingPartAPI.getById(bookingId);
	}

	listForBooking(bookingId, qdata) {
		BookingPartAPI.listForBooking(bookingId, qdata);
	}

	listForBookable(bookableId, qdata) {
		BookingPartAPI.listForBookable(bookableId, qdata);
	}

	approve(bookingPart) {
		BookingPartAPI.transitionToStatus(bookingPart.id, "approved");
	}

	cancel(bookingPart) {
		BookingPartAPI.transitionToStatus(bookingPart.id, "cancelled");
	}

	reject(bookingPart) {
		BookingPartAPI.transitionToStatus(bookingPart.id, "rejected");
	}

	create(bookingPart) {
		return BookingPartAPI.create(bookingPart);
	}

	destroy(bookingPartOrId) {
		let bookingId = bookingPartOrId;
		if (bookingPartOrId.hasOwnProperty('id')) {
			bookingId = bookingPartOrId.id;
		}

		return BookingPartAPI.destroy(bookingId);
	}
}

export default new BookingPartActions();

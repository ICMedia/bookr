import BookingAPI from "../utils/BookingAPI";

class BookingActions {

	listAll(query) {
		BookingAPI.listAll(query);
	}

	getById(id) {
		BookingAPI.getById(id);
	}

	create(booking) {
		return BookingAPI.create(booking);
	}

	destroy(bookingOrId) {
		let bookingId = bookingOrId;
		if (bookingOrId.hasOwnProperty('id')) {
			bookingId = bookingOrId.id;
		}

		return BookingAPI.destroy(bookingId);
	}

}

export default new BookingActions();

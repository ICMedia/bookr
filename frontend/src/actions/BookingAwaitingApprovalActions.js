import BookingAPI from "../utils/BookingAPI";
import BookingConstants from "../constants/BookingConstants";

let _refreshInterval = setInterval(() => {
	BookingAPI.listAwaitingApproval();
}, BookingConstants.AWAITING_APPROVAL_REFRESH_INTERVAL);

class BookingAwaitingApprovalActions {

	list() {
		BookingAPI.listAwaitingApproval();
	}

}

export default new BookingAwaitingApprovalActions();

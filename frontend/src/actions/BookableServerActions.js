import BookableConstants from '../constants/BookableConstants';
import AppDispatcher from '../dispatcher/AppDispatcher';

class BookableServerActions {

	receiveBookablesForQuery(qdata, finalResults) {
		AppDispatcher.dispatch({
			actionType: BookableConstants.BOOKABLE_RECEIVE_BOOKABLES_FOR_QUERY,
			query: qdata,
			bookables: finalResults
		});
	}

	receiveBookable(bookable) {
		AppDispatcher.dispatch({
			actionType: BookableConstants.BOOKABLE_RECEIVE_BOOKABLE,
			bookable: bookable
		});
	}
}

export default new BookableServerActions();

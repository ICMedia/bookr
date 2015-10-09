import AppDispatcher from '../dispatcher/AppDispatcher';
import BookableConstants from '../constants/BookableConstants';
import BaseStore from "./BaseStore";

import { API } from "../utils/api_info";

let _bookables = {};
let _queryCache = {};

class BookableStore extends BaseStore {
	getById(id) {
		return _bookables[id];
	}

	listForQuery(query) {
		if (!_queryCache[API.toQueryString(query)]) return [];
		return _queryCache[API.toQueryString(query)].map((bookableId) => _bookables[bookableId]);
	}

	userCanApproveFor(id, username) {
		if (!_bookables[id]) return false;
		if (!username) return false;

		return _bookables[id].approvers.map((approver) => approver.approver.username).indexOf(username) !== -1;
	}
}

const BOOKABLE_STORE = new BookableStore();
export default BOOKABLE_STORE;

AppDispatcher.register((action) => {
	switch (action.actionType) {
		case BookableConstants.BOOKABLE_RECEIVE_BOOKABLE:
			_bookables[action.bookable.id] = action.bookable;
			BOOKABLE_STORE.emitChange();
			break;
		case BookableConstants.BOOKABLE_RECEIVE_BOOKABLES_FOR_QUERY:
			action.bookables.map((bookable) => {
				_bookables[bookable.id] = bookable;
			});
			_queryCache[API.toQueryString(action.query)] = action.bookables.map((bookable) => bookable.id).filter((bookable) => !!bookable);
			BOOKABLE_STORE.emitChange();
			break;
		default:
		// no op
	}
});



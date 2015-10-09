import EventEmitter from "events";

const CHANGE_EVENT = 'change';

export default class BaseStore extends EventEmitter {
	constructor() {
		super();
	}

	emitChange() {
		this.emit(CHANGE_EVENT);
	}

	addChangeListener(callback) {
		if (__SERVER__) {
			console.trace("addChangeListener called on server-side!");
			return;
		}
		this.on(CHANGE_EVENT, callback);
	}

	removeChangeListener(callback) {
		if (__SERVER__) {
			console.trace("removeChangeListener called on server-side!");
			return;
		}
		this.removeListener(CHANGE_EVENT, callback);
	}
}

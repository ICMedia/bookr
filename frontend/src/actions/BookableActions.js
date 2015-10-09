import BookableAPI from "../utils/BookableAPI";

class BookableActions {

	listAll(query) {
		BookableAPI.listAll(query);
	}

	getById(id) {
		BookableAPI.getById(id);
	}

}

export default new BookableActions();

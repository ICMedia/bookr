import __fetch from "isomorphic-fetch";
import React from "react";
import Transmit from "react-transmit";

import { API } from "../utils/api_info";

import BookableListPanel from "./BookableListPanel";

class BookableList extends React.Component {
	render () {
		const {bookables} = this.props;

		return (
			<div className="container">
				<h3>Bookable Spaces</h3>
				<BookableListPanel bookables={bookables}></BookableListPanel>
			</div>
		);
	}
}

export default Transmit.createContainer(BookableList, {
	initialVariables: {
		nextPage:       1,
		pagesToFetch:   15,
		prevBookables: []
	},
	fragments: {
		bookables ({nextPage, pagesToFetch, prevBookables}) {
			let destination = API.path("/bookings/bookables/");

			return fetch(
				destination + `?page=${nextPage}`, {
					method: 'GET',
					headers: {
						'Accept': 'application/json'
					}
				}
			).then((response) => response.json()).then((body) => {
				if (!body.results || !body.results.length) {
					pagesToFetch = 0;

					return prevBookables;
				}

				return prevBookables.concat(body.results);
			}).catch((error) => {
				console.error(error);
			})
		}
	}
});


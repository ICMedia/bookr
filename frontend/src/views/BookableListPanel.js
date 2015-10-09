import React from "react";

import BookablePanel from "./BookablePanel";

export default class BookableListPanel extends React.Component {
	render () {
		const {bookables} = this.props;

		const bookablePanels = bookables.map((bookable) => (<BookablePanel key={bookable.id} bookable={bookable}></BookablePanel>));

		return (
			<div className="card-deck">
				{bookablePanels}
			</div>
		);
	}
}

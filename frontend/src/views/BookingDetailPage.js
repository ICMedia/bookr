import React from "react";

import BookingDetail from "./BookingDetail";

export default class BookingDetailPage extends React.Component {
	render () {
		const {params} = this.props;

		return (
			<BookingDetail bookingId={params.bookingId} history={this.props.history} />
		);
	}
}

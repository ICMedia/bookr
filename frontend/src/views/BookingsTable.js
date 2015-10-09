import React from "react";
import { Link } from "react-router";
import moment from "moment";

import BookingPartStore from "../stores/BookingPartStore";
import BookingPartActions from "../actions/BookingPartActions";

import status from "../utils/statuses";
import GlobalConstants from "../constants/GlobalConstants";

export default class BookingsTable extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			bookingParts: {}
		};

		this.onBookingPartChange = this.onBookingPartChange.bind(this);
	}

	componentWillMount() {
		BookingPartStore.addChangeListener(this.onBookingPartChange);

		this.loadBookingParts(this.props.bookings.map((booking) => booking.id));
	}

	componentWillUnmount() {
		BookingPartStore.removeChangeListener(this.onBookingPartChange);
	}

	componentWillReceiveProps(newProps) {
		// diff the new and old props
		let differ = {};
		let addToDiffer = (val, diff) => {
			differ[val] = differ[val] ? differ[val]+diff : diff;
		};

		// if we already have the data (probably), set it to -1
		this.props.bookings.map((booking) => addToDiffer(booking.id, -1));

		// if it's in the new set, add 1
		// this means entirely new values will be at "1" and old values will be at "0"
		newProps.bookings.map((booking) => addToDiffer(booking.id, 1));

		// now look for any values which are at "1" or higher (ie entirely new values)
		let newBookingIds = Object.keys(differ).filter((bookingId) => differ[bookingId] > 0);
		if (newBookingIds.length > 0) {
			this.loadBookingParts(newBookingIds);
		}
	}

	render() {
		const {bookings} = this.props;

		return (
			<table className="table table-bordered">
				<thead>
					<tr>
						<th>Name</th>
						<th>Status</th>
						<th>Start Time</th>
						<th>End Time</th>
					</tr>
				</thead>
				<tbody>
				{bookings.map((booking) => (
					<tr className={this.generateTableRowClass(booking)} key={booking.id}>
						<th className={`event-title-type-${booking.type}`}><Link to={`/bookings/${booking.id}`}>{booking.name}</Link></th>
						{!!this.state.bookingParts[booking.id] ? [
							<td key="status">{this.generateStatus(booking)}</td>,
							<td key="startTime">{this.formatMoment(this.generateStartTime(booking))}</td>,
							<td key="endTime">{this.formatMoment(this.generateEndTime(booking))}</td>
						] : [
							<td key="status">Loading</td>,
							<td key="startTime">Loading</td>,
							<td key="endTime">Loading</td>
						]}
					</tr>
				))}
				</tbody>
			</table>
		);
	}

	generateTableRowClass(booking) {
		const bookingParts = this.state.bookingParts[booking.id];
		if (!bookingParts) return 'tablerow-status-loading';

		return 'tablerow-status-' + status.generateOverallStatus(bookingParts.map((bookingPart) => bookingPart.status)) + ` tablerow-type-${booking.type}`;
	}

	generateStatus(booking) {
		const bookingParts = this.state.bookingParts[booking.id];
		if (!bookingParts) return 'Loading';

		return status.statusMap()[status.generateOverallStatus(bookingParts.map((bookingPart) => bookingPart.status))];
	}

	formatMoment(moment) {
		if (moment === null) return 'Unknown';
		return moment.format(GlobalConstants.DATE_FORMAT);
	}

	generateStartTime(booking) {
		const bookingParts = this.state.bookingParts[booking.id];
		return bookingParts.map((bookingPart) => (
			moment(bookingPart.booking_start)
		)).reduce((prevVal, curVal) => (
			(prevVal === null || curVal.isBefore(prevVal)) ? curVal : prevVal
		), null);
	}

	generateEndTime(booking) {
		const bookingParts = this.state.bookingParts[booking.id];
		return bookingParts.map((bookingPart) => (
			moment(bookingPart.booking_end)
		)).reduce((prevVal, curVal) => (
			(prevVal === null || curVal.isAfter(prevVal)) ? curVal : prevVal
		), null);
	}

	onBookingPartChange() {
		let bookingParts = {};

		this.props.bookings.map((booking) => {
			bookingParts[booking.id] = BookingPartStore.listForBooking(booking.id);
		});

		this.setState({
			bookingParts: bookingParts
		});
	}

	loadBookingParts(bookingIds) {
		bookingIds.map((bookingId) => BookingPartActions.listForBooking(bookingId));
	}
}

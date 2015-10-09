import React from "react";
import moment from "moment";

import Calendar from "./Calendar";
import { API } from "../utils/api_info";
import statuses from "../utils/statuses";

import BookingStore from "../stores/BookingStore";
import BookingPartStore from "../stores/BookingPartStore";
import AuthStore from "../stores/AuthStore";

import BookingActions from "../actions/BookingActions";
import BookingPartActions from "../actions/BookingPartActions";

import BookingPartDetailRow from "./BookingPartDetailRow";

export default class BookingDetail extends React.Component {
	constructor (props) {
		super(props);

		this.onBookingStoreChange = this.onBookingStoreChange.bind(this);
		this.onBookingPartStoreChange = this.onBookingPartStoreChange.bind(this);
	}

	componentWillMount () {
		BookingStore.addChangeListener(this.onBookingStoreChange);
		BookingPartStore.addChangeListener(this.onBookingPartStoreChange);

		this.updateWithVariables(this.props);
	}

	componentWillUnmount() {
		BookingStore.removeChangeListener(this.onBookingStoreChange);
		BookingPartStore.removeChangeListener(this.onBookingPartStoreChange);
	}

	componentWillReceiveProps (nextProps) {
		const interestedIn = ["bookingId"];
		let hasChanged = false;
		for (let interestingProperty of interestedIn) {
			if (nextProps[interestingProperty] != this.props[interestingProperty]) {
				hasChanged = true;
			}
		}

		if (hasChanged) {
			this.updateWithVariables(nextProps);
		}
	}

	updateWithVariables (props) {
		BookingActions.getById(props.bookingId);
		BookingPartActions.listForBooking(props.bookingId);

		this.setState({
			booking: BookingStore.getById(props.bookingId),
			bookingParts: BookingPartStore.listForBooking(props.bookingId)
		});
	}

	canApprove(bookingPart) {
		if (!AuthStore.getUserInfo().loggedIn) {
			return false;
		}

		return BookingPartStore.userCanApprove(bookingPart.id, AuthStore.getUserInfo().username);
	}

	render () {
		const {booking, bookingParts} = this.state;

		let myBookingParts = bookingParts || [];
		myBookingParts = myBookingParts.slice();

		if (!booking) {
			return (
				<div className="container">
					<div>
						<h1>Hang on a sec...</h1>
					</div>
				</div>
			)
		}

		const canApproveAny = myBookingParts.map(this.canApprove).indexOf(true) !== -1;
		const canApproveAll = myBookingParts.map(this.canApprove).indexOf(false) === -1;

		const bulkShowApprove = myBookingParts.map((bookingPart) => bookingPart.status === 'pending_approval').indexOf(true) !== -1;
		const bulkButtons = bulkShowApprove ? this.renderBulkButtons() : [];

		return (
			<div className="container">
				<div>
					<h1 className={`event-title-type-${booking.type}`}>{booking.name}</h1>

					<dl className="row">
						<dt className="col-sm-2">Description:</dt>
							<dd className="col-sm-10">{booking.description}</dd>

						<dt className="col-sm-2">Status:</dt>
							<dd className="col-sm-10">{this.generateStatus(booking, myBookingParts)}</dd>
					</dl>
				</div>

				<div>
					<h2>Booking Overview</h2>
					<table className="table table-bordered">
						<thead>
							<tr>
								<th>Room</th>
								<th>Status</th>
								<th>From</th>
								<th>To</th>
								<th>Duration</th>
								{canApproveAny ? (
									<th>Actions</th>
								) : []}
							</tr>
						</thead>
						<tbody>
						{myBookingParts.map((bookingPart) => (
							<BookingPartDetailRow key={bookingPart.id} bookingPart={bookingPart} showApprovalColumn={canApproveAny} />
						))}
						</tbody>
					</table>
				</div>

				{canApproveAll && bulkButtons && false ? (
					<div>
						<h2>Bulk Approval</h2>
						{bulkButtons}
					</div>
				) : (<div></div>)}
			</div>
		);
	}

	generateStatus (booking, bookingParts) {
		let status = 'pending_approval';
		const statusMap = statuses.statusMap();
		let statusCounts = {};
		bookingParts.forEach((bookingPart) => {
			if (!statusCounts[bookingPart.status]) {
				statusCounts[bookingPart.status] = 1;
			} else {
				statusCounts[bookingPart.status]++;
			}
		});
		if (Object.keys(statusCounts).length == 1) {
			return statusMap[Object.keys(statusCounts)[0]];
		}
		return "Various statuses - see below";
	}

	onBookingStoreChange() {
		this.setState({
			booking: BookingStore.getById(this.props.bookingId)
		});
	}

	onBookingPartStoreChange() {
		this.setState({
			bookingParts: BookingPartStore.listForBooking(this.props.bookingId)
		})
	}

	renderBulkButtons() {
		const representedStates = this.generateRepresentedStates();

		let buttons = [];

		if (representedStates.pending_approval !== 0) {
			buttons.push(
				<button key="approve" className="btn btn-lg btn-success">Approve</button>
			);
		}

		return buttons;
	}

	generateRepresentedStates() {
		let states = {};
		this.state.bookingParts.map((bookingPart) => {
			if (!states[bookingPart.status]) {
				states[bookingPart.status] = 0;
			}
			states[bookingPart.status]++;
		});
		return states;
	}
}

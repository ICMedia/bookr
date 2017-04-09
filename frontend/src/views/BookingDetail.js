import React from "react";
import moment from "moment";
import { Link } from "react-router";

import Calendar from "./Calendar";
import { API } from "../utils/api_info";
import statuses from "../utils/statuses";

import BookingStore from "../stores/BookingStore";
import BookingPartStore from "../stores/BookingPartStore";
import AuthStore from "../stores/AuthStore";

import BookingActions from "../actions/BookingActions";
import BookingPartActions from "../actions/BookingPartActions";

import BookingPartDetailRow from "./BookingPartDetailRow";

import GlobalConstants from "../constants/GlobalConstants";

export default class BookingDetail extends React.Component {
	constructor (props) {
		super(props);

		this.state = {
			user: AuthStore.getUserInfo()
		};

		this.onBookingStoreChange = this.onBookingStoreChange.bind(this);
		this.onBookingPartStoreChange = this.onBookingPartStoreChange.bind(this);
		this.onAuthChange = this.onAuthChange.bind(this);

		this.canApprove = this.canApprove.bind(this);
		this.destroyBooking = this.destroyBooking.bind(this);
	}

	componentWillMount () {
		BookingStore.addChangeListener(this.onBookingStoreChange);
		BookingPartStore.addChangeListener(this.onBookingPartStoreChange);
		AuthStore.addChangeListener(this.onAuthChange);

		this.updateWithVariables(this.props);
	}

	componentWillUnmount() {
		BookingStore.removeChangeListener(this.onBookingStoreChange);
		BookingPartStore.removeChangeListener(this.onBookingPartStoreChange);
		AuthStore.addChangeListener(this.onAuthChange);
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
		if (!this.state.user.loggedIn) {
			return false;
		}

		return BookingPartStore.userCanApprove(bookingPart.id, this.state.user.username);
	}

	destroyBooking () {
		BookingActions.destroy(this.state.booking).then(() => {
      this.props.history.pushState(null, '/');
    })
	}

	formatName (creator) {
		if (creator.firstName) {
			return <span>{creator.firstName} {creator.lastName} (<tt>{creator.username}</tt>)</span>
		}
		return <tt>{creator.username}</tt>
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

		const conflicts = this.gatherConflicts(myBookingParts);

		return (
			<div>
				<div className="jumbotron">
					<div className="container">
						<h1 className={`event-title-type-${booking.type}`}>{booking.name}</h1>

						<dl className="row">
							<dt className="col-sm-2">Description:</dt>
							<dd className="col-sm-10">{booking.description}</dd>

							<dt className="col-sm-2">Booker:</dt>
							<dd className="col-sm-10">{this.formatName(booking.creator)}</dd>

							{booking.type === 'booking' ? [
								<dt key="1" className="col-sm-2">Status:</dt>,
								<dd key="2" className="col-sm-10">{this.generateStatus(booking, myBookingParts)}</dd>
							] : []}
						</dl>

						{booking.deletable.authorised ? (
							<div className="row">
								<button className="btn btn-danger" disabled={!booking.deletable.state} onClick={this.destroyBooking}>Delete!</button>
							</div>
						) : []}
					</div>
				</div>

				<div className="container">
					<div>
						<h2>Booking Overview</h2>
						<table className="table">
							<thead>
								<tr>
									<th>Room</th>
									{booking.type === 'booking' ? <th>Status</th> : []}
									<th>From</th>
									<th>To</th>
									<th>Duration</th>
									{canApproveAny ? (
										<th>Actions</th>
									) : []}
								</tr>
							</thead>
							<tbody>
							{myBookingParts.map((bookingPart) => [
								<BookingPartDetailRow key={bookingPart.id} bookingPart={bookingPart} showApprovalColumn={canApproveAny} showStatusColumn={booking.type === 'booking'} />
							].concat(this.renderConflictRow(conflicts, bookingPart, 6 - (!canApproveAny) - (booking.type !== 'booking'))))}
							</tbody>
						</table>
					</div>

					{canApproveAll && bulkButtons && false ? (
						<div>
							<h2>Bulk Approval</h2>
							{bulkButtons}
						</div>
					) : []}
				</div>
			</div>
		);
	}

	renderConflictRow(conflicts, bookingPart, colCount) {
		if (bookingPart.status != 'pending_approval' || !conflicts.has(bookingPart.id)) return;

		const hardConflicts = conflicts.get(bookingPart.id).filter((conflict) => conflict.type === 'hard');
		const softConflicts = conflicts.get(bookingPart.id).filter((conflict) => conflict.type !== 'hard');

		let out = [];
		let hasExplainedConflicts = false;

		let renderConflict = (conflict) => (
			<tr key={`${bookingPart.id}-conflict-${conflict.id}`}>
				<td>&nbsp;</td>
				<td colSpan={colCount-1} className={`table-cell-conflict-${conflict.type}`}>
					<Link to={`/bookings/${conflict.booking.id}`}><strong className={`event-title-type-${conflict.booking.type}`}>{conflict.booking.name}</strong></Link>{conflict.booking.type === 'booking' ?
					<span> by <em>{this.generateName(conflict.booking.creator)}</em> ({statuses.prettyTextForStatus(conflict.status)})</span>
					:
					[]}<br />
					<strong>{moment(conflict.booking_start).format(GlobalConstants.DATE_FORMAT)}</strong> until <strong>{moment(conflict.booking_end).format(GlobalConstants.DATE_FORMAT)}</strong>
				</td>
			</tr>
		);

		if (hardConflicts.length) {
			out.push(
				<tr key="explain-hard">
					<td colSpan={colCount}>
						This booking has conflicts with other events and <strong>cannot be approved</strong> until these are resolved.
					</td>
				</tr>
			);
			hasExplainedConflicts = true;

			out = out.concat(hardConflicts.map((conflict) => renderConflict(conflict)));
		}

		if (softConflicts.length) {
			out.push(
				<tr key="explain-soft">
					<td colSpan={colCount}>
						{hasExplainedConflicts ? (
							'The following conflicts are advisory and do not prevent you from approving this booking.'
						) : (
							'This booking has conflicts with other events, however you can still approve this booking'
						)}
					</td>
				</tr>
			);
			hasExplainedConflicts = true;

			out = out.concat(softConflicts.map((conflict) => renderConflict(conflict)));
		}

		return out;
	}

	generateName (user) {
		if (user.firstName && user.lastName) {
			return <span>{user.firstName} {user.lastName} (<tt>{user.username}</tt>)</span>
		}
		return <tt>{user.username}</tt>
	}

	gatherConflicts (bookingParts) {
		if (!bookingParts) return [];
		return new Map(bookingParts.map((bookingPart) => [bookingPart.id, BookingPartStore.conflicts(bookingPart.id)]));
	}

	generateStatus (booking, bookingParts) {
		return statuses.statusMap()[statuses.generateOverallStatus(bookingParts.map((bookingPart) => bookingPart.status))];
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

	onAuthChange() {
		this.setState({
			user: AuthStore.getUserInfo()
		});
	}
}

import React from "react";
import moment from "moment";
import { Link } from "react-router";
import Tooltip from "rc-tooltip";

import statuses from "../utils/statuses";

import BookingPartStore from "../stores/BookingPartStore";
import BookableStore from "../stores/BookableStore";
import AuthStore from "../stores/AuthStore";

import BookingPartActions from "../actions/BookingPartActions";

export default class BookingPartDetailRow extends React.Component {
	constructor(props) {
		super(props);

		this.onStoreChange = this.onStoreChange.bind(this);

		this.onApproveClicked = this.onApproveClicked.bind(this);
		this.onRejectClicked = this.onRejectClicked.bind(this);
		this.onCancelClicked = this.onCancelClicked.bind(this);
	}

	componentWillMount() {
		BookingPartStore.addChangeListener(this.onStoreChange);
		BookableStore.addChangeListener(this.onStoreChange);
		AuthStore.addChangeListener(this.onStoreChange);
		this.onStoreChange();
	}

	componentWillUnmount() {
		BookingPartStore.removeChangeListener(this.onStoreChange);
		BookableStore.removeChangeListener(this.onStoreChange);
		AuthStore.removeChangeListener(this.onStoreChange);
	}

	render () {
		const { bookingPart, showApprovalColumn } = this.props;
		return (
			<tr key={bookingPart.id} className={`tablerow-status-${bookingPart.status}`}>
				<th><Link to={`/bookables/${bookingPart.bookable.id}`}>{bookingPart.bookable.name}</Link></th>
				<td>{statuses.prettyTextForStatus(bookingPart.status)}</td>
				<td>{moment(bookingPart.booking_start).format('Mo MMM YYYY @ HH:mm')}</td>
				<td>{moment(bookingPart.booking_end).format('Mo MMM YYYY @ HH:mm')}</td>
				<td>{moment.duration(moment(bookingPart.booking_end).diff(moment(bookingPart.booking_start))).humanize()}</td>
				{showApprovalColumn ? (
					<td>
						<div className="btn-group" role="group">
							{this.state.canApprove ? this.renderButtons() : []}
						</div>
					</td>
				) : []}
			</tr>
		);
	}

	approvable() {
		return BookingPartStore.hasConflicts(this.props.bookingPart.id);
	}

	renderButtons () {
		let buttons = [];

		const status = this.props.bookingPart.status;

		if (status === "rejected" || status === "cancelled") {
			return [];
		}

		if (this.state.canApprove) {
			if (status === "pending_approval") {
				buttons.push(
					<button key="approve" className="btn btn-success btn-sm" onClick={this.onApproveClicked} disabled={!this.approvable()}>Approve</button>
				);
			}

			buttons.push(
				<button key="reject" className="btn btn-danger btn-sm" onClick={this.onRejectClicked}>Reject</button>
			);
		}

		if (this.props.bookingPart.booking.creator.username === AuthStore.getUserInfo().username) {
			buttons.push(
				<button key="cancel" className="btn btn-warning btn-sm" onClick={this.onCancelClicked}>Cancel</button>
			);
		}

		return buttons;
	}

	onStoreChange() {
		this.setState({
			canApprove: BookingPartStore.userCanApprove(this.props.bookingPart, AuthStore.getUserInfo().username)
		});
	}

	onApproveClicked() {
		BookingPartActions.approve(this.props.bookingPart);
	}

	onCancelClicked() {
		BookingPartActions.cancel(this.props.bookingPart);
	}

	onRejectClicked() {
		BookingPartActions.reject(this.props.bookingPart);
	}
}

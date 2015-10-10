import React from "react";
import moment from "moment";
import { Link } from "react-router";
import Tooltip from "rc-tooltip";

import statuses from "../utils/statuses";

import BookingPartStore from "../stores/BookingPartStore";
import BookableStore from "../stores/BookableStore";
import AuthStore from "../stores/AuthStore";

import GlobalConstants from "../constants/GlobalConstants";

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
		const { bookingPart, showApprovalColumn, showStatusColumn } = this.props;

		const bookingStartMoment = moment(bookingPart.booking_start);
		const bookingEndMoment = moment(bookingPart.booking_end);

		const year = bookingStartMoment.year(),
			 month = bookingStartMoment.month()+1;

		return (
			<tr key={bookingPart.id} className={`tablerow-status-${bookingPart.status} tablerow-type-${bookingPart.booking.type}`}>
				<th><Link to={`/bookables/${bookingPart.bookable.id}/${year}/${month}`}>{bookingPart.bookable.name}</Link></th>
				{showStatusColumn ? <td>{statuses.prettyTextForStatus(bookingPart.status)}</td> : []}
				<td>{bookingStartMoment.format(GlobalConstants.DATE_FORMAT)}</td>
				<td>{bookingEndMoment.format(GlobalConstants.DATE_FORMAT)}</td>
				<td>{moment.duration(bookingEndMoment.diff(bookingStartMoment)).humanize()}</td>
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
		return !BookingPartStore.hasConflicts(this.props.bookingPart.id);
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

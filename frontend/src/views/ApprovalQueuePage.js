import React from "react";

import BookingStore from "../stores/BookingStore";
import BookingActions from "../actions/BookingActions";

import AuthStore from "../stores/AuthStore";
import AuthActions from "../actions/AuthActions";

import BookingsTable from "./BookingsTable";

export default class ApprovalQueuePage extends React.Component {
	constructor (props) {
		super(props);

		this.state = {
			user: {loggedIn: false},
			bookings: [],
			loading: true
		};

		this.onUserChange = this.onUserChange.bind(this);
		this.onBookingsChange = this.onBookingsChange.bind(this);
	}

	componentWillMount() {
		AuthStore.addChangeListener(this.onUserChange);
		BookingStore.addChangeListener(this.onBookingsChange);

		this.onUserChange(); // will also kick off retrieving bookings
	}

	componentWillUnmount() {
		AuthStore.removeChangeListener(this.onUserChange);
		BookingStore.removeChangeListener(this.onBookingsChange);
	}

	renderName() {
		if (this.state.user.firstName) {
			return `${this.state.user.firstName}'s`;
		} else if (this.state.user.username) {
			return <span><tt>{this.state.user.username}</tt>'s</span>;
		}
		return "My";
	}

	render() {
		const {params} = this.props;

		return (
			<div>
				<div className="jumbotron">
					<div className="container">
						<h1>{this.renderName()} Approval Queue</h1>
					</div>
				</div>

				<div className="container">
					{!this.state.loading ?
						(<BookingsTable bookings={this.state.bookings}></BookingsTable>)
					:
						(<h3>Still loading... Give me a second!</h3>)
					}
				</div>
			</div>
		);
	}

	onUserChange() {
		const userInfo = AuthStore.getUserInfo();

		if (userInfo.username === this.state.user.username) {
			return; // don't refresh
		}

		this.setState({
			user: userInfo
		});

		if (userInfo.loggedIn) {
			BookingActions.listAll({awaiting_approval_by: userInfo.username});
		}
	}

	onBookingsChange() {
		this.setState({
			bookings: BookingStore.listForQuery({awaiting_approval_by: this.state.user.username}),
			loading: false
		});
	}
}

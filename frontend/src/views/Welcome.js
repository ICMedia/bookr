import __fetch from "isomorphic-fetch";
import React from "react";
import InlineCss from "react-inline-css";
import Transmit from "react-transmit";

import LoginForm from "./LoginForm";
import BookableList from "./BookableList";
import BookingsTable from "./BookingsTable";

import BookingStore from "../stores/BookingStore";
import BookingActions from "../actions/BookingActions";

import { Link } from "react-router";

export default class Welcome extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			futureBookings: []
		};

		this.onBookingStoreChange = this.onBookingStoreChange.bind(this);
	}

	componentWillMount() {
		if (__CLIENT__) {
			BookingStore.addChangeListener(this.onBookingStoreChange);

			BookingActions.listAll({in_the_future: 1});
		}
	}

	componentWillUnmount() {
		if (__CLIENT__) {
			BookingStore.removeChangeListener(this.onBookingStoreChange);
		}
	}

	render () {
		const {user} = this.props;

		let displayName = user.firstName;
		if (!displayName) {
			displayName = user.username;
		}

		return (
			<div>
				<div className="jumbotron">
					<div className="container">
						<h1>ICU Media Group Room Bookings</h1>
						<p>If you're looking to make room bookings for space in the West Basement, you've come to the right place.</p>
						<p>If you want to book J&amp;R's room, though, you'll need to go over to <a href="https://www.union.ic.ac.uk/arts/jazzrock/">their system</a>.</p>
					</div>
				</div>

				{!user.loggedIn ? (
					<div className="container">
						<div className="row">
							<div className="col-md-12">
								<LoginForm />
							</div>
						</div>
					</div>
				) : (
					<div>
						<div className="container">
							<div className="row">
								<div className="col-md-12">
									<h2>Hi, {displayName}!</h2>
								</div>
							</div>
						</div>
						<div className="container">
							<div className="row">
								<div className="col-md-12">
									<h3>Your upcoming bookings</h3>
									<BookingsTable bookings={this.state.futureBookings} />
									<Link to="/me/bookings" className="btn btn-primary pull-right">Show me all of my bookings</Link>
								</div>
							</div>
						</div>
						<BookableList />
					</div>
				)}
			</div>
		);
	}

	onBookingStoreChange() {
		this.setState({
			futureBookings: BookingStore.listForQuery({in_the_future: 1})
		})
	}
}

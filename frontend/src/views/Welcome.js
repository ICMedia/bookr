import __fetch from "isomorphic-fetch";
import React from "react";
import InlineCss from "react-inline-css";
import Transmit from "react-transmit";

import LoginForm from "./LoginForm";
import BookableList from "./BookableList";

export default class Welcome extends React.Component {
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
						{user.loggedIn ? (
							<p>Logged in</p> ) : (
							<p>Not Logged In</p>
						)}
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
						<BookableList />
					</div>
				)}
			</div>
		);
	}
}

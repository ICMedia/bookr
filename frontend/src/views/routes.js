import React from "react";
import {Router, Route} from "react-router";

import Main from "views/Main";
//import BookableList from "views/BookableList";
//import BookableDetailPage from "views/BookableDetailPage";
//import BookingDetailPage from "views/BookingDetailPage";

/**
 * The React Router 1.0 routes for both the server and the client.
 */
if (__SERVER__) {
	require = () => {};
	require.ensure = () => {};
}

let exportedRouter = null;
if (__SERVER__) {
	exportedRouter = (
		<Router>
			<Route path="/*" component={Main} />
		</Router>
	);
} else {
	var BookableList = require('./BookableList'),
		BookableDetailPage = require('./BookableDetailPage'),
		BookingDetailPage = require('./BookingDetailPage');

	exportedRouter = (
		<Router>
			<Route path="/" component={Main}>
				<Route path="bookables/:bookableId" component={BookableDetailPage}>
					<Route path=":year/:month" component={BookableDetailPage} />
				</Route>
				<Route path="bookings/:bookingId" component={BookingDetailPage} />
			</Route>
		</Router>
	);
}

export default exportedRouter;

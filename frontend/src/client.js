import React from "react";
import ReactDOM from "react-dom";
import {Router} from "react-router";
import Transmit from "react-transmit";
import routes from "views/routes";
import {createHistory} from "history";

import "react-datetime/css/react-datetime.css";
import "../bootstrap/scss/bootstrap-flex.scss";
import "scss/calendar.scss";
import "scss/bookingparts.scss";

/**
 * Fire-up React Router.
 */
const reactRoot = window.document.getElementById("react-root");
Transmit.render(Router, {routes, history: createHistory()}, reactRoot);

/**
 * Detect whether the server-side render has been discarded due to an invalid checksum.
 */
if (process.env.NODE_ENV !== "production") {
	if (!reactRoot.firstChild || !reactRoot.firstChild.attributes ||
	    !reactRoot.firstChild.attributes["data-react-checksum"]) {
		console.error("Server-side React render was discarded. Make sure that your initial render does not contain any client-side code.");
	}
}


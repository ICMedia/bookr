import {Server} from "hapi";
import h2o2 from "h2o2";
import inert from "inert";
import url from "url";
import React from "react";
import ReactDOM from "react-dom/server";
import {RoutingContext, match} from "react-router";
import createLocation from "history/lib/createLocation";
import Transmit from "react-transmit";
import routes from "views/routes";

var hostname = process.env.HOSTNAME || "localhost";

/**
 * Start Hapi server on port 8000.
 */
const server = new Server();

server.connection({host: hostname, port: process.env.PORT || 8000});

server.register([
	h2o2,
    inert
], function (err) {
	if (err) {
		throw err;
	}

	server.start(function () {
		console.info("==> ✅  Server is listening");
		console.info("==> 🌎  Go to " + server.info.uri.toLowerCase());
	});
});

/**
 * Attempt to serve static requests from the public folder.
 */
server.route({
	method:  "GET",
	path:    "/{params*}",
	handler: {
		file: (request) => "static" + request.path
	}
});

server.route({
	method: ["GET", "POST", "PATCH", "DELETE"],
	path: "/api/{path*}",
	handler: {
		proxy: {
			passThrough: true,
			xforward: true,
			host: "localhost",
			port: 8111,
			onResponse (err, res, request, reply, settings, ttl) {
				reply(res);
			}
		}
	}
});

/**
 * Catch dynamic requests here to fire-up React Router.
 */
server.ext("onPreResponse", (request, reply) => {
	if (typeof request.response.statusCode !== "undefined") {
		return reply.continue();
	}

	let location = createLocation(request.path);

	match({routes, location}, (error, redirectLocation, renderProps) => {
		if (redirectLocation) {
			reply.redirect(redirectLocation.pathname + redirectLocation.search)
		}
		else if (error || !renderProps) {
			reply.continue();
		}
		else {
			Transmit.renderToString(RoutingContext, renderProps).then(({reactString, reactData}) => {
				const webserver = process.env.NODE_ENV === "production" ? "" : "//" + hostname + ":8080";

				let output = (
					`<!doctype html>
				<html lang="en-us">
					<head>
						<meta charset="utf-8">
						<meta http-equiv="X-UA-Compatible" content="IE=edge">
						<meta name="viewport" content="width=device-width, initial-scale=1">

						<title>ICU Media Group Room Bookings</title>
						<link rel="shortcut icon" href="/favicon.ico">
						<link rel="stylesheet" href="${webserver}/dist/style.css">
					</head>
					<body>
						<div id="react-root">${reactString}</div>
					</body>
				</html>`
				);
				output = Transmit.injectIntoMarkup(output, reactData, [`${webserver}/dist/client.js`]);

				reply(output);
			}).catch((error) => {
				console.error(error);
				console.log(error.stack);
			});
		}
	});
});

import React from "react";

import BookablePanel from "./BookablePanel";
import Calendar from "./Calendar";
import NewBookingForm from "./NewBookingForm";

import BookableActions from "../actions/BookableActions";
import BookableStore from "../stores/BookableStore";
import BookingPartActions from "../actions/BookingPartActions";
import BookingPartStore from "../stores/BookingPartStore";

import AuthStore from "../stores/AuthStore";

export default class BookableDetail extends React.Component {
	constructor (props) {
		super(props);

		this.state = {
			user: AuthStore.getUserInfo()
		};

		this.onNewBooking = this.onNewBooking.bind(this);
		this.onBookableStoreChange = this.onBookableStoreChange.bind(this);
		this.onBookingPartStoreChange = this.onBookingPartStoreChange.bind(this);
		this.onAuthStoreChange = this.onAuthStoreChange.bind(this);
	}

	onAuthStoreChange () {
		this.setState({
			user: AuthStore.getUserInfo()
		})
	};

	updateWithVariables (props) {
		BookableActions.getById(props.bookableId);
		BookingPartActions.listForBookable(props.bookableId, {in_date: props.fmtStr});

		this.setState({
			bookable: BookableStore.getById(props.bookableId),
			bookingParts: BookingPartStore.listForBookable(props.bookableId, {in_date: props.fmtStr})
		});
	}

	componentWillMount () {
		BookableStore.addChangeListener(this.onBookableStoreChange);
		BookingPartStore.addChangeListener(this.onBookingPartStoreChange);
		AuthStore.addChangeListener(this.onAuthStoreChange);

		this.updateWithVariables(this.props);
	}

	componentWillUnmount() {
		BookableStore.removeChangeListener(this.onBookableStoreChange);
		BookingPartStore.removeChangeListener(this.onBookingPartStoreChange);
		AuthStore.removeChangeListener(this.onAuthStoreChange);
	}

	componentWillReceiveProps (nextProps) {
		const interestedIn = ["year", "month", "day", "bookableId"];
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

	render () {
		const {bookable, bookingParts} = this.state;

		if (!bookable) {
			return (
				<div className="container">
					<div>
						<h1>Just a sec...</h1>
					</div>
				</div>
			);
		}

		const {year, month, day} = this.props;

		const allowedEventTypes = bookable.approvers.map((approver) => approver.approver.username).indexOf(this.state.user.username) !== -1 ? ['booking', 'unavailable', 'warning'] : ['booking'];

		return (
			<div>
				<div className="jumbotron">
					<div className="container">
						<h1>{bookable.name}</h1>

						<p>{bookable.notes}</p>
					</div>
				</div>

				<div className="container">
					<div>
						<h2>Upcoming Bookings</h2>
						<Calendar events={bookingParts} year={year} month={month} day={day} pathPrefix={`/bookables/${bookable.id}`} displayText={this.generateDisplayText} generateLink={this.generateLink} />
					</div>
				</div>

				<br />{/** TODO(lukegb): actually use CSS **/}

				<div className="container">
					<div>
						<h2>Make a new booking</h2>
						<NewBookingForm bookableId={bookable.id} onNewBookingCreated={this.onNewBooking} allowedEventTypes={allowedEventTypes}></NewBookingForm>
					</div>
				</div>
			</div>
		);
	}

	generateDisplayText (event) {
		return event.booking.name;
	}

	generateLink (event) {
		return `/bookings/${event.booking.id}`;
	}

	onNewBooking (booking, bookingParts) {
		//this.updateWithVariables(this.props);
		this.props.history.pushState(null, `/bookings/${booking.id}`);
	}

	onBookableStoreChange() {
		this.setState({
			bookable: BookableStore.getById(this.props.bookableId)
		});
	}

	onBookingPartStoreChange() {
		this.setState({
			bookingParts: BookingPartStore.listForBookable(this.props.bookableId, {in_date: this.props.fmtStr})
		})
	}
}

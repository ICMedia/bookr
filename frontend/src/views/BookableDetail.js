import React from "react";

import BookablePanel from "./BookablePanel";
import Calendar from "./Calendar";
import NewBookingForm from "./NewBookingForm";

import BookableActions from "../actions/BookableActions";
import BookableStore from "../stores/BookableStore";
import BookingPartActions from "../actions/BookingPartActions";
import BookingPartStore from "../stores/BookingPartStore";

export default class BookableDetail extends React.Component {
	constructor (props) {
		super(props);

		this.onNewBooking = this.onNewBooking.bind(this);
		this.onBookableStoreChange = this.onBookableStoreChange.bind(this);
		this.onBookingPartStoreChange = this.onBookingPartStoreChange.bind(this);
	}

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

		this.updateWithVariables(this.props);
	}

	componentWillUnmount() {
		BookableStore.removeChangeListener(this.onBookableStoreChange);
		BookingPartStore.removeChangeListener(this.onBookingPartStoreChange);
	}

	componentWillReceiveProps (nextProps) {
		const interestedIn = ["year", "month", "day"];
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

		return (
			<div className="container">
				<div>
					<h1>{bookable.name}</h1>

					<p>{bookable.notes}</p>
				</div>

				<div>
					<h2>Upcoming Bookings</h2>
					<Calendar events={bookingParts} year={year} month={month} day={day} pathPrefix={`/bookables/${bookable.id}`} displayText={this.generateDisplayText} generateLink={this.generateLink} />
				</div>

				<div>
					<h2>Make a new booking</h2>
					<NewBookingForm bookableId={bookable.id} onNewBookingCreated={this.onNewBooking}></NewBookingForm>
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

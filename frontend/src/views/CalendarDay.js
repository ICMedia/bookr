import React from "react";
import { Link } from "react-router";

import moment from "moment";

export default class CalendarDay extends React.Component {
	render () {
		const { date, events } = this.props;

		let classNames = "calendar-day";
		if (this.props.isOtherMonth) {
			classNames += " calendar-other-month-day";
		}
		if (this.props.date.day() === 1) {
			classNames += " calendar-first-day-in-week";
		}
		if (this.props.date.day() === 0) {
			classNames += " calendar-last-day-in-week";
		}

		let processedEvents = [];
		if (events) {
			for (let event of events) {
				let classNames = `calendar-event calendar-event-status-${event.status} calendar-event-type-${event.booking.type}`;
				if (event.begins_today) {
					classNames += " calendar-event-start";
				}
				if (event.ends_today) {
					classNames += " calendar-event-end";
				}
				let target = event.pushUpBy - processedEvents.length;
				for (let n = 0; n < target; n++) {
					let name = `${event.id}-${n}-${event.pushUpBy}-${processedEvents.length}`;
					processedEvents.push(<div className="calendar-event-spacefiller" data-what={name} key={name} />);
				}
				let text = "";
				if (event.show_text) {
					text = this.props.displayText(event);
					classNames += " calendar-event-text";
				}
				if (event.begins_today && event.ends_today) {
					if (text.length)
						text += " ";
					text += `\(${moment(event.booking_start).format("HH:mm")}-${moment(event.booking_end).format("HH:mm")})`;
				} else if (event.begins_today) {
					if (text.length)
						text += " ";
					text += `\(${moment(event.booking_start).format("HH:mm")}-)`;
				} else if (event.ends_today) {
					if (text.length)
						text += " ";
					text += `\(-${moment(event.booking_end).format("HH:mm")})`;
				}
				processedEvents.push(<div className={classNames} key={event.id}><Link to={this.props.link(event)}>{text}</Link></div>);
			}
		}

		return (
			<div className={classNames}>
				{date.format("D")}
				<div className="calendar-events">
					{processedEvents}
				</div>
			</div>
		);
	}
}

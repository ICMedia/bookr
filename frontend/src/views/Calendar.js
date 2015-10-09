import React from "react";
import { Link, RouteContext } from "react-router";
import moment from "moment";

import CalendarDay from "./CalendarDay";
import statuses from "../utils/statuses";

export default class Calendar extends React.Component {
	render () {
		const { day, month, year, events, isLoading } = this.props;

		// build events information
		let dayEvents = {};
		let sortedEvents = (events ? events.slice() : []);
		sortedEvents = sortedEvents.map((event) => {
			event.booking_start_moment = moment(event.booking_start);
			event.booking_end_moment = moment(event.booking_end);
			return event;
		});
		sortedEvents.sort((a, b) => {
			let adate = a.booking_start_moment;
			let bdate = b.booking_start_moment;
			if (adate.isBefore(bdate)) {
				return -1;
			} else if (adate.isAfter(bdate)) {
				return 1;
			} else {
				return 0;
			}
		});
		for (let event of sortedEvents) {
			const startDate = event.booking_start_moment;
			const endDate = event.booking_end_moment;

			let currentPushUp = 0;

			let myDate = moment(startDate).startOf('day');
			while (myDate.isBefore(endDate)) {
				if (!dayEvents[myDate.format("YYYY-MM-DD")]) {
					dayEvents[myDate.format("YYYY-MM-DD")] = [];
				}
				let todayEvent = Object.assign({}, event);
				todayEvent.begins_today = myDate.isSame(startDate, 'day');
				todayEvent.ends_today = myDate.isSame(endDate, 'day') || (
						endDate.hour() === 0 &&
						endDate.minute() === 0 &&
						moment(endDate).subtract(1, 'days').isSame(myDate, 'day')
					);
				todayEvent.show_text = todayEvent.begins_today || myDate.day() === 1 || myDate.date() === 1;
				if (todayEvent.begins_today) {
					todayEvent.pushUpBy = 0;
					currentPushUp = dayEvents[myDate.format("YYYY-MM-DD")].map((ev) => ev.pushUpBy).reduce((prev, cur) => cur > prev ? cur : prev+1, 0);
				} else if (myDate.day() === 1) {
					todayEvent.pushUpBy = 0;
					currentPushUp = 0;
				} else {
					todayEvent.pushUpBy = currentPushUp;
				}
				dayEvents[myDate.format("YYYY-MM-DD")].push(todayEvent);
				myDate.add(1, 'day');
			}
		}

		let dayCells = [];

		// how many days from the preceding month?
		let momentArr = [year, month, day].filter((x) => x).map((x) => parseInt(x, 10));
		if (momentArr[1]) {
			momentArr[1] -= 1; // because zero-indexing, why
		}
		let dayInQuestion = moment(momentArr);
		let monthStart = dayInQuestion.startOf('month');
		let myMoment = moment(monthStart);
		const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
		const needLeadingDays = days.indexOf(myMoment.format('ddd'));
		myMoment.subtract(needLeadingDays, 'days');
		while (myMoment.date() != 1) {
			const key = myMoment.format("YYYY-MM-DD");
			dayCells.push(<CalendarDay isOtherMonth={true} events={dayEvents[key]} key={key} date={moment(myMoment)} displayText={this.props.displayText} link={this.props.generateLink} />);
			myMoment.add(1, 'days');
		}

		// now add the days from this month
		do {
			const key = myMoment.format("YYYY-MM-DD");
			dayCells.push(<CalendarDay isOtherMonth={false} events={dayEvents[key]} key={key} date={moment(myMoment)} displayText={this.props.displayText} link={this.props.generateLink} />);
			myMoment.add(1, 'days');
		} while (myMoment.date() != 1);

		// now from next month
		const needTrailingDays = days.length - days.indexOf(myMoment.format('ddd')) + 1;
		while (myMoment.date() != needTrailingDays) {
			const key = myMoment.format("YYYY-MM-DD");
			dayCells.push(<CalendarDay isOtherMonth={true} events={dayEvents[key]} key={key} date={moment(myMoment)} displayText={this.props.displayText} link={this.props.generateLink} />);
			myMoment.add(1, 'days');
		}

		return (
			<div>
				<h4 className="calendar-title">{monthStart.format("MMMM YYYY")}</h4>
				<ul className="pager">
					<li className="pager-prev"><Link to={`${this.props.pathPrefix}/${moment(monthStart).subtract(1, 'month').format('YYYY/MM')}`}>Last month</Link></li>
					<li className="pager-next"><Link to={`${this.props.pathPrefix}/${moment(monthStart).add(1, 'month').format('YYYY/MM')}`}>Next month</Link></li>
				</ul>
				<div className={`calendar` + (isLoading ? ' calendar-loading': '')}>
					<div className="calendar-head-day">Mon</div>
					<div className="calendar-head-day">Tue</div>
					<div className="calendar-head-day">Wed</div>
					<div className="calendar-head-day">Thu</div>
					<div className="calendar-head-day">Fri</div>
					<div className="calendar-head-day">Sat</div>
					<div className="calendar-head-day">Sun</div>
					{dayCells}
				</div>

				<h5 className="calendar-event-key-title">Colour key</h5>
				<div className="calendar-event-key">
					{statuses.statuses().map((status) => (
						<div className={`calendar-event-key-item calendar-event-status-${status}`} key={status}>{statuses.prettyTextForStatus(status)}</div>
					))}
				</div>
			</div>
		);
	}
}

import React from "react";
import { Link } from 'react-router';

export default class BookablePanel extends React.Component {
	render () {
		const {bookable} = this.props;

		return (
			<div className="card">
				<div className="card-block">
					<h4 className="card-title">{bookable.name}</h4>
					<p className="card-text">{bookable.notes}</p>
					<Link to={`/bookables/${bookable.id}`} className="btn btn-primary">View calendar</Link>
				</div>
			</div>
		);
	}
}

import React from "react";

import BookableDetail from "./BookableDetail";

export default class BookableDetailPage extends React.Component {
	render () {
		const {params} = this.props;

		let { year, month, day } = params;

		if (!year && !month && !day) {
			let now = new Date();
			year = now.getFullYear();
			month = now.getMonth();
		}

		let padToDigits = (num, toDigits) => {
			let numstr = num.toString();
			while (numstr.length < toDigits) {
				numstr = '0' + numstr;
			}
			return numstr;
		};

		let fmtStr = "";
		if (year) {
			fmtStr = padToDigits(year, 4);
		}
		if (year && month) {
			fmtStr += `-${padToDigits(month, 2)}`;
		}
		if (year && month && day) {
			fmtStr += `-${padToDigits(day, 2)}`;
		}

		let variables = {
			year:   year,
			month:  month,
			day:    day,
			fmtStr: fmtStr,

			bookableId: params.bookableId
		};
		return (
			<BookableDetail {...variables} history={this.props.history} />
		);
	}
}

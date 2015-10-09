class Statuses {
	statusMap() {
		return {
			'pending_approval': 'Pending Approval',
			'approved': 'Approved',
			'cancelled': 'Cancelled',
			'rejected': 'Rejected',
			'unknown': 'Unknown',
			'various': 'Various statuses'
		}
	}

	statuses() {
		return ['pending_approval', 'approved', 'cancelled', 'rejected'];
	}

	prettyTextForStatus(status) {
		return this.statusMap()[status] || 'Unknown status';
	}

	generateOverallStatus(substatuses) {
		if (substatuses.length === 0) {
			return 'unknown';
		}

		let statusCounts = {};
		substatuses.forEach((substatus) => {
			if (!statusCounts[substatus]) {
				statusCounts[substatus] = 1;
			} else {
				statusCounts[substatus]++;
			}
		});
		if (Object.keys(statusCounts).length == 1) {
			return Object.keys(statusCounts)[0];
		}

		return "various";
	}
}

const STATUSES = new Statuses();

export default STATUSES;

class Statuses {
	statusMap() {
		return {
			'pending_approval': 'Pending Approval',
			'approved': 'Approved',
			'cancelled': 'Cancelled',
			'rejected': 'Rejected',
		}
	}

	statuses() {
		return ['pending_approval', 'approved', 'cancelled', 'rejected'];
	}

	prettyTextForStatus(status) {
		return this.statusMap()[status] || 'Unknown status';
	}
}

const STATUSES = new Statuses();

export default STATUSES;

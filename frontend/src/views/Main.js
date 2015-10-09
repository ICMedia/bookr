import React from "react";
import { Link } from "react-router";

import LoginForm from "./LoginForm";
import BookableListPanel from "./BookableListPanel";
import Welcome from "./Welcome";

import AuthStore from "../stores/AuthStore";
import AuthActions from "../actions/AuthActions";
import { API } from "../utils/api_info";

import BookableStore from "../stores/BookableStore";
import BookableActions from "../actions/BookableActions";

import BookingAwaitingApprovalStore from "../stores/BookingAwaitingApprovalStore";
import BookingAwaitingApprovalActions from "../actions/BookingAwaitingApprovalActions";

import Dropdown from "./Dropdown";

export default class Main extends React.Component {
	constructor (props) {
		super(props);
		this.state = {
			user: {
				loggedIn: false
			},
			bookableItems: [],
			awaitingApproval: []
		};

		this.userChanged = this.userChanged.bind(this);
		this.onStoreUpdate = this.onStoreUpdate.bind(this);
		this.onLogoutClicked = this.onLogoutClicked.bind(this);
	}

	userChanged () {
		const userInfo = AuthStore.getUserInfo();

		if (this.state.user.username !== userInfo.username) {
			BookingAwaitingApprovalActions.list();
		}

		this.setState({user: userInfo});
	}

	componentWillMount () {
		if (__CLIENT__) {
			AuthStore.addChangeListener(this.userChanged);

			BookableStore.addChangeListener(this.onStoreUpdate);
			BookingAwaitingApprovalStore.addChangeListener(this.onStoreUpdate);

			BookableActions.listAll({});
			BookingAwaitingApprovalActions.list();
		}
	}

	componentWillUnmount () {
		if (__CLIENT__) {
			AuthStore.removeChangeListener(this.userChanged);
			BookableStore.removeChangeListener(this.onStoreUpdate);
			BookingAwaitingApprovalStore.removeChangeListener(this.onStoreUpdate);
		}
	}

	render() {
		let children = this.props.children;
		if (!this.props.children || !this.state.user.loggedIn) {
			children = (<Welcome user={this.state.user} />);
		}

		let bookableItems = this.state.bookableItems.map((bookable) => {
			if (!bookable) return null;
			const relativeDest = `/bookables/${bookable.id}`;
			const destination = this.props.history.createHref(relativeDest);
			const isActive = this.props.history.isActive(destination, null);
			return (
				<li key={bookable.id} className={'nav-item' + (isActive ? ' active' : '')}>
					<Link className="nav-link" to={relativeDest}>{bookable.name}</Link>
				</li>
			);
		}).filter((item) => !!item);

		const isQueueActive = this.props.history.isActive(this.props.history.createHref(`/me/queue`), null);

		return (
			<div>
				<nav className="navbar navbar-dark navbar-sticky-top bg-primary">
					<Link to={`/`} className="navbar-brand">ICU Media Group</Link>
					<ul className="nav navbar-nav">
						{bookableItems}
						{this.state.user.isApprover ? (
							<li className={`nav-item ${isQueueActive ? 'active' : ''}`}>
								<Link to="/me/queue" className="nav-link">Awaiting Approval <span className="label label-info">{this.state.awaitingApproval.length}</span></Link>
							</li>
						) : []}
					</ul>
					{this.state.user.loggedIn ? (
						<div className="pull-right nav navbar-nav">
							<Dropdown className="nav-item" label={this.state.user.username} rightAligned={true}>
								<Link className="dropdown-item" to="/me/bookings">My bookings</Link>
								<a className="dropdown-item" href="#" onClick={this.onLogoutClicked}>Log out</a>
							</Dropdown>
						</div>
					) : []}
				</nav>

				<div className="main-container">
					{children}
				</div>
			</div>
		);
	}

	onStoreUpdate() {
		this.setState({
			bookableItems: BookableStore.listForQuery({}),
			awaitingApproval: BookingAwaitingApprovalStore.list()
		})
	}

	onLogoutClicked() {
		AuthActions.logout();
	}
}

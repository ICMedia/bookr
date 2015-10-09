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

export default class Main extends React.Component {
	constructor (props) {
		super(props);
		this.state = {
			user: {
				loggedIn: false
			},
			bookableItems: [],
			awaitingApproval: [],
			userBoxExpanded: false
		};

		this.userChanged = this.userChanged.bind(this);
		this.onStoreUpdate = this.onStoreUpdate.bind(this);
		this.onLogoutClicked = this.onLogoutClicked.bind(this);
		this.toggleExpandedUserBox = this.toggleExpandedUserBox.bind(this);
	}

	userChanged () {
		if (this.state.user.username !== AuthStore.getUserInfo().username) {
			BookingAwaitingApprovalActions.list();
		}

		this.setState({user: AuthStore.getUserInfo()});
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

		return (
			<div>
				<nav className="navbar navbar-dark navbar-sticky-top bg-primary">
					<Link to={`/`} className="navbar-brand">ICU Media Group</Link>
					<ul className="nav navbar-nav">
						{bookableItems}
						{this.state.user.isApprover ? (
							<li className="nav-item">
								<a href="#" className="nav-link">Awaiting Approval <span className="label label-info">{this.state.awaitingApproval.length}</span></a>
							</li>
						) : []}
					</ul>
					{this.state.user.loggedIn ? (
						<div className="pull-right nav navbar-nav">
							<div className={'dropdown nav-item' + (this.state.userBoxExpanded ? ' open' : '')}>
								<a href="#" id="userDropdown" className="nav-link" aria-haspopup="true" aria-expanded={this.state.userBoxExpanded} onClick={this.toggleExpandedUserBox}>{this.state.user.username}</a>
								<div className="dropdown-menu dropdown-menu-right" aria-labelledby="userDropdown">
									<a className="dropdown-item" href="#" onClick={this.onLogoutClicked}>Log out</a>
								</div>
							</div>
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

	toggleExpandedUserBox() {
		this.setState({
			userBoxExpanded: !this.state.userBoxExpanded
		})
	}
}

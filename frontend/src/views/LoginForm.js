import React from "react";

import AuthActions from "../actions/AuthActions";
import AuthStore from "../stores/AuthStore";

export default class LoginForm extends React.Component {
	constructor (props) {
		super(props);
		this.state = {
			username: '',
			password: '',
			errors: AuthStore.getLoginErrors(),
			disabled: false
		};
		this.mounted = false;

		this.handleChangeUsername = this.handleChangeUsername.bind(this);
		this.handleChangePassword = this.handleChangePassword.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);

		this.checkAuthErrors = this.checkAuthErrors.bind(this);
	}

	componentWillMount() {
		this.mounted = true;
		AuthStore.addChangeListener(this.checkAuthErrors);
	}

	componentWillUnmount() {
		this.mounted = false;
		AuthStore.removeChangeListener(this.checkAuthErrors);
	}

	render () {
		let hasErrors = this.state.errors.length > 0;

		return (
			<div>
				<h2>Log in</h2>
				<p>Before you can continue, you'll need to log in using your Imperial College username and password.</p>
				<form onSubmit={this.handleSubmit}>
					<div className={`form-group row` + (hasErrors ? ' has-error': '')}>
						<label htmlFor="inputUsername" className="col-sm-2 form-control-label">Username</label>
						<div className="col-sm-10">
							<input type="text" className="form-control" id="inputUsername" placeholder="Username" value={this.state.username} onChange={this.handleChangeUsername}  disabled={this.state.disabled} />
						</div>
					</div>
					<div className={`form-group row` + (hasErrors ? ' has-error': '')}>
						<label htmlFor="inputPassword" className="col-sm-2 form-control-label">Password</label>
						<div className="col-sm-10">
							<input type="password" className="form-control" id="inputPassword" placeholder="Password" value={this.state.password} onChange={this.handleChangePassword} disabled={this.state.disabled} />
						</div>
					</div>
					<div className="form-group row">
						<div className="col-sm-offset-2 col-sm-10">
							<button className="btn btn-secondary" disabled={this.state.disabled}>Log in</button>
						</div>
					</div>
				</form>
			</div>
		);
	}

	handleChangeUsername (event) {
		this.setState({
			username: event.target.value
		})
	}

	handleChangePassword (event) {
		this.setState({
			password: event.target.value
		})
	}

	handleSubmit (event) {
		event.preventDefault();

		this.setState({
			errors: [],
			disabled: true
		});
		AuthActions.login(this.state.username, this.state.password);
	}

	checkAuthErrors () {
		if (!this.mounted) return;
		this.setState({
			errors: AuthStore.getLoginErrors(),
			disabled: false
		});
	}
}

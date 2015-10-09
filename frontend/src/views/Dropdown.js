import React from "react";
import ReactDOM from "react-dom";

export default class Dropdown extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			open: false
		};

		this.handleBackgroundClick = this.handleBackgroundClick.bind(this);
		this.handleClick = this.handleClick.bind(this);

		this.mounted = false;
		this.expandatron = null;
	}

	componentWillMount() {
		document.addEventListener("click", this.handleBackgroundClick);
		this.mounted = true;
	}

	componentWillUnmount() {
		this.mounted = false;
		document.removeEventListener("click", this.handleBackgroundClick);
	}

	handleBackgroundClick(ev) {
		if (!this.mounted) return;
		if (!this.expandatron) return;
		if (this.expandatron.contains(event.target)) return;

		this.setState({
			open: false
		});
	}

	handleClick(ev) {
		if (!this.mounted) return;

		this.setState({
			open: !this.state.open
		});

		return false;
	}

	render() {
		return (
			<div className={`dropdown ${this.state.open ? 'open' : ''} ${this.props.className}`}>
				<a href="#" className="nav-link" aria-haspopup="true" aria-expanded={this.state.open} onMouseDown={this.handleClick} onTouchEnd={this.handleClick} ref={(link) => {
					this.expandatron = link;
				}}>{this.props.label}</a>
				<div className={`dropdown-menu ${this.props.rightAligned ? 'dropdown-menu-right' : ''}`}>
					{this.props.children}
				</div>
			</div>
		);

	}
}

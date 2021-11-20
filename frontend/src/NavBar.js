import React from 'react';
import { authenticationService } from './_services/authentication.service';
import { Link, useNavigate } from 'react-router-dom';
import UserIcon from './UserIcon';

class NeedsAdmin extends React.Component {
  render() {
    if (this.props.me && this.props.me.is_admin) {
      return (<li className="nav-item dropdown dropstart">
        <span
          className="nav-link dropdown-toggle clickable"
          data-bs-toggle="dropdown">
          Edit Questions
        </span>
        <ul className="dropdown-menu">
          {this.props.children}
        </ul>
      </li>);
    }
    return null;
  }
}

class DropdownLink extends React.Component {
  render = () => (<li>
    <Link to={this.props.to} className="dropdown-item">{this.props.children}</Link>
  </li>)
}

class NavComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      token: null,
      me: null
    };
  }

  componentDidMount() {
    authenticationService.user.subscribe(data => {
      this.setState({ me: data });
    });
  }

  render = () => (<nav className="navbar navbar-expand-md navbar-dark bg-dark">
    <div className="container-fluid">
      <Link className="navbar-brand" to="/">Advent of Quorum 2021</Link>
      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarTogglerDemo01"
        aria-controls="navbarTogglerDemo01"
        aria-expanded="false"
        aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse">
        <ul className="navbar-nav">
          {this.state.me ? <li className="nav-item">
            <Link to="questions" className="nav-link">Questions</Link>
          </li> : ""}
        </ul>
        <ul className="navbar-nav flex-row flex-wrap ms-md-auto">
          <NeedsAdmin me={this.state.me}>
            <DropdownLink to="editquestion">Update</DropdownLink>
            <li><hr className="dropdown-divider"/></li>
            <DropdownLink to="postquestion">Post New</DropdownLink>
          </NeedsAdmin>
          <UserIcon user={this.state.me} navigate={this.props.navigate} />
        </ul>
      </div>
    </div>
  </nav>)
}

const NavBar = () => (<NavComponent navigate={useNavigate()}/>);

export default NavBar;

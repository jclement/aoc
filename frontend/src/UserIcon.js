import React from 'react';
import { authenticationService } from './_services/authentication.service';
import { Link } from 'react-router-dom';

class BtnLogin extends React.Component {
  render() {
    return (<li>
      <Link to="login" className="btn btn-light">Login</Link>
    </li>);
  }
}

class UserIcon extends React.Component {

  logout = evt => {
    evt.stopPropagation();
    evt.preventDefault();
    authenticationService.logout();
    this.props.navigate("/");
  }

  render() {
    if (!this.props.user) {
      return (<BtnLogin />);
    }

    return (<li className="nav-item dropdown dropstart">
      <span
        className="nav-link dropdown-toggle clickable"
        data-bs-toggle="dropdown">
        <img
          className="userIcon"
          src={`https://robohash.org/${this.props.user.id}.png?size=50x50`}
          alt={this.props.user.username} />
          {this.props.user.username}
      </span>
      <ul className="dropdown-menu">
        <li>
          <Link to="profile" className="dropdown-item">Profile</Link>
        </li>
        <li><hr className="dropdown-divider" /></li>
        <li>
          <button className="dropdown-item" onClick={this.logout}>Logout</button>
        </li>
      </ul>
    </li>);
  }
}

export default UserIcon;

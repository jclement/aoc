import React from 'react';
import { authenticationService } from './_services/authentication.service';

class BtnLogin extends React.Component {
  render() {
    return (<li className="btn btn-light">
      <span
        className="clickable"
        onClick={authenticationService.login}>Login</span>
    </li>);
  }
}

class UserIcon extends React.Component {
  logout = evt => {
    evt.stopPropagation();
    evt.preventDefault();
    authenticationService.logout();
  }

  render() {
    if (!this.props.user) {
      return (<BtnLogin />);
    }

    return (<li className="nav-item dropdown">
      <span
        className="nav-link dropdown-toggle clickable"
        data-bs-toggle="dropdown">
        <img
          className="userIcon"
          src={`https://robohash.org/${this.props.user.username}.png?size=50x50`}
          alt={this.props.user.username} />
      </span>
      <ul className="dropdown-menu">
        <li>
          <div className="dropdown-item">{this.props.user.username}</div>
        </li>
        <li><hr className="dropdown-divider" /></li>
        <li>
          <a
            href="#"
            className="dropdown-item"
            onClick={this.logout}>Logout</a>
        </li>
      </ul>
    </li>);
  }
}

export default UserIcon;

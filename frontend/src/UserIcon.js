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

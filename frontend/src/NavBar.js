import React from 'react';
import {
  Link
  // Outlet
} from 'react-router-dom';

class NavComponent extends React.Component {
  render = () => (<nav className="navbar navbar-expand-md navbar-dark bg-dark">
    <div className="container-fluid">
      <Link className="navbar-brand" to="/">Advent of Code 2021</Link>
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
          <li className="nav-item">
            <Link className="nav-link" to="calendar">Calendar</Link>
          </li>
        </ul>
      </div>
    </div>
  </nav>)
}

const NavBar = () => (<NavComponent />);

export default NavBar;

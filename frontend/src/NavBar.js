import React from 'react';
import { authenticationService } from './_services/authentication.service';
import { Link } from 'react-router-dom';

class NavBtn extends React.Component {
  render = () => (<li className="nav-item">
    <button
      className={`btn btn-${this.props.btnClass ? this.props.btnClass : 'secondary'}`}
      onClick={this.props.btnClick}>
      {this.props.btnText}
    </button>
  </li>);
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
    authenticationService.token.subscribe(x => this.setState({ token: x }));

    fetch('/api/me', {
      method: 'GET',
      headers: authenticationService.authHeader(),
    })
    .then(response => response.json())
    .then(data => {
      this.setState({ me: data },);
    })
  }

  showMyInfo = () => {
    const me = this.state.me;
    if (me) {
      console.log('me:', me);
      alert('Me: ' + me.username);
    } else {
      alert('Me: <null>');
    }
  }

  render = () => {
    const { token } = this.state;

    return (<nav className="navbar navbar-expand-md navbar-dark bg-dark">
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
              <Link to="calendar" className="nav-link">Calendar</Link>
            </li>
          </ul>
          <ul className="navbar-nav flex-row flex-wrap ms-md-auto">
            {
              this.state.me && this.state.me.is_admin ?
                (<li className="nav-item">
                  <Link to="postquestion" className="nav-link">Post Question</Link>
                </li>) :
                null
            }
            {
              token ?
                <NavBtn btnClick={authenticationService.logout} btnText="Logout"/> :
                <NavBtn btnClick={authenticationService.login} btnText="Login"/>
            }
            <NavBtn btnClick={this.showMyInfo} btnText="Who am I?" btnClass="info"/>
          </ul>
        </div>
      </div>
    </nav>);
  }
}

const NavBar = () => (<NavComponent />);

export default NavBar;

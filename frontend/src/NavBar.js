import React from 'react';
import { authenticationService } from './_services/authentication.service';
import { Link, useNavigate } from 'react-router-dom';
import UserIcon from './UserIcon';

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
    authenticationService.user.subscribe(data => {
      this.setState({ me: data });
    });
  }

  showMyInfo = () => {
    const me = this.state.me;
    if (me) {
      alert('Me: ' + me.username);
    } else {
      alert('Me: <null>');
    }
  }

  render = () => {
    return (<nav className="navbar navbar-expand-md navbar-dark bg-dark">
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
            {
              this.state.me && this.state.me.is_admin ?
                (<li className="nav-item">
                  <Link to="postquestion" className="nav-link">Post Question</Link>
                </li>) :
                null
            }
            <UserIcon user={this.state.me} navigate={this.props.navigate} />
          </ul>
        </div>
      </div>
    </nav>);
  }
}

const NavBar = () => (<NavComponent navigate={useNavigate()}/>);

export default NavBar;

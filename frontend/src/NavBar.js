import React from 'react';
import { authenticationService } from './_services/authentication.service';
import { Link, useNavigate } from 'react-router-dom';
import UserIcon from './UserIcon';

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

  render() {
    const isAdmin = this.state.me && this.state.me.is_admin

    return (<nav className={"navbar navbar-expand-md navbar-dark " + (isAdmin ? "bg-danger": "bg-dark")}>
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">Advent of Quorum 2021</Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div  id="navbarContent" className="collapse navbar-collapse">
          <ul className="navbar-nav">
            <a href="https://teams.microsoft.com/l/team/19%3ajlXlzIhH2H71MsHX7wKcjboZx8ti5w-b5s34IJYysM41%40thread.tacv2/conversations?groupId=01351aa0-8d38-4cd9-986e-0a9a0642efb2&tenantId=ce68f836-c221-45ef-866b-38cda86b3d5e" className="nav-link">AoQ Support Group</a>
            {isAdmin && <Link to="editquestion" className="nav-link">Manage Questions</Link>}
            {isAdmin && <Link to="postquestion" className="nav-link">New Question</Link>}
          </ul>
          <ul className="navbar-nav flex-row flex-wrap ms-md-auto">
            <UserIcon user={this.state.me} navigate={this.props.navigate} />
          </ul>
        </div>
      </div>
    </nav>);
  }
}

const NavBar = () => (<NavComponent navigate={useNavigate()}/>);

export default NavBar;

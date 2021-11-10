import React from 'react';
import './App.css';
import Leaderboard from './Leaderboard';
import { authenticationService } from './_services/authentication.service';
import Calendar from './Calendar';
import DayQuestion from './DayQuestion';
import {
  BrowserRouter,
  Link,
  Routes,
  Route
  // Outlet
} from 'react-router-dom';

class AppComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      token: null,
      me: null
    };
  }

  componentDidMount() {
    authenticationService.token.subscribe(x => this.setState({ token: x }));
  }

  getMe() {
    fetch('/api/me', {
      method: "GET",
      headers: authenticationService.authHeader(),
    })
    .then(response => response.json())
    .then(data => this.setState({me: data.username}));
  }

  render() {
    const { token } = this.state;

    return (
      <div className="App">
        {!token && <button onClick={authenticationService.login}>Login</button>}
        {token && <button onClick={authenticationService.logout}>Logout</button>}
        <h1>Really Really Lame Leaderboard</h1>
        <Leaderboard />
        {token && <button onClick={this.getMe.bind(this)}>Get Info</button>}
        {this.state.me}

        <Link to="/calendar">Calendar</Link>
      </div>
    );
  }
}

const App = () => (<BrowserRouter>
  <Routes>
    <Route path="/" element={<AppComponent/>} />
    <Route path="calendar" element={<Calendar/>} />
    <Route path="calendar/:day" element={<DayQuestion/>} />
  </Routes>
</BrowserRouter>);

export default App;

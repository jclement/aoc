import React from 'react';
import './App.css';
import Leaderboard from './Leaderboard';
import { authenticationService } from './_services/authentication.service';
import Calendar from './Calendar';
import DayQuestion from './DayQuestion';
import FourOhFour from './FourOhFour';
import NavBar from './NavBar';
import {
  BrowserRouter,
  Routes,
  Route
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
      </div>
    );
  }
}

// Despite all examples, nested routes don't work.

const App = () => (<div>
  <BrowserRouter>
    <NavBar/>
    <div className="container-lg">
      <Routes>
        <Route path="/" element={<AppComponent/>} />
        <Route path="calendar" element={<Calendar/>} />
        <Route path="calendar/:day" element={<DayQuestion/>} />
        <Route path="*" element={<FourOhFour/>} />
      </Routes>
    </div>
  </BrowserRouter>
</div>);

export default App;

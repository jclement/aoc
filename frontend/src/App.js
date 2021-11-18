import React from 'react';
import Leaderboard from './Leaderboard';
import QuestionList from './QuestionList';
import EmptyQuestion from './EmptyQuestion';
import Question from './Question';
import PostQuestion from './PostQuestion';
import FourOhFour from './FourOhFour';
import NavBar from './NavBar';
import Login from './Login';
import { authenticationService } from './_services/authentication.service';
import {
  BrowserRouter,
  Outlet,
  Routes,
  Route,
} from 'react-router-dom';

class AppComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { user: null };
  }

  componentDidMount() {
    authenticationService.user.subscribe(x => {
      this.setState({ user: x });
    });
  }

  render = () => (<div>
    <NavBar/>
    <br/>
    <div className="container-lg">
      <Outlet/>
    </div>
  </div>);
}
      //{ this.state.user ? <Outlet/> : <NeedLogin/> }

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { user: null, auth_initialized: false };
  }

  componentDidMount() {
    authenticationService.user.subscribe(x => {
      if (x !== undefined) { 
        this.setState({ user: x, auth_initialized: true});
      }
    });
  }

  render = () => {

    var that = this;
    const RequireAuth = function({children}) {
      if (!that.state.auth_initialized) 
        return ""
      return that.state.user ? children : "Login"
    };

    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppComponent/>} >
            <Route index element={<Leaderboard />} />
            <Route path="postquestion" element={<PostQuestion/>} />

            <Route path="login" element={<Login />} />

            <Route path="questions" element={<RequireAuth><QuestionList /></RequireAuth>}>
              <Route index element={<EmptyQuestion/>} />
              <Route path=":day" element={<RequireAuth><Question/></RequireAuth>} />
            </Route>

            <Route path="*" element={<FourOhFour/>} />
          </Route>
        </Routes>
      </BrowserRouter>);
  }
}

export default App;

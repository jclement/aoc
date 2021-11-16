import React from 'react';
import Leaderboard from './Leaderboard';
import QuestionList from './QuestionList';
import EmptyQuestion from './EmptyQuestion';
import Question from './Question';
import PostQuestion from './PostQuestion';
import FourOhFour from './FourOhFour';
import NavBar from './NavBar';
import NeedLogin from './NeedLogin';
import { authenticationService } from './_services/authentication.service';
import {
  BrowserRouter,
  Outlet,
  Routes,
  Route
} from 'react-router-dom';

class AppComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { token: null };
  }

  componentDidMount() {
    authenticationService.token.subscribe(x => {
      this.setState({ token: x ? x : null });
    })
  }

  render = () => (<div>
    <NavBar/>
    <br/>
    <div className="container-lg">
      { this.state.token ? <Outlet/> : <NeedLogin/> }
    </div>
  </div>);
}

const App = () => (<BrowserRouter>
  <Routes>
    <Route path="/" element={<AppComponent/>} >
      <Route index element={<Leaderboard />} />
      <Route path="postquestion" element={<PostQuestion/>} />

      <Route path="questions" element={<QuestionList/>} >
        <Route index element={<EmptyQuestion/>} />
        <Route path=":day" element={<Question/>} />
      </Route>

      <Route path="*" element={<FourOhFour/>} />
    </Route>
  </Routes>
</BrowserRouter>);

export default App;

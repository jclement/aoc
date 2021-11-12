import React from 'react';
import Leaderboard from './Leaderboard';
import Calendar from './Calendar';
import DayQuestion from './DayQuestion';
import PostQuestion from './PostQuestion';
import FourOhFour from './FourOhFour';
import NavBar from './NavBar';
import {
  BrowserRouter,
  Outlet,
  Routes,
  Route
} from 'react-router-dom';

class AppComponent extends React.Component {
  render = () => (<div>
    <NavBar/>
    <div className="container-lg">
      <Outlet />
    </div>
  </div>);
}

const App = () => (<BrowserRouter>
  <Routes>
    <Route path="/" element={<AppComponent/>} >
      <Route index element={<Leaderboard />} />
      <Route path="calendar" element={<Calendar/>} />
      <Route path="calendar/:day" element={<DayQuestion/>} />
      <Route path="postquestion" element={<PostQuestion/>} />
      <Route path="*" element={<FourOhFour/>} />
    </Route>
  </Routes>
</BrowserRouter>);

export default App;

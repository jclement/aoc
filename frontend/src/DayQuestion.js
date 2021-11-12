import React from 'react';
import FourOhFour from './FourOhFour';
import {
  useParams
} from 'react-router-dom';
import { authenticationService } from './_services/authentication.service';

class DayComponent extends React.Component {

  componentDidMount = () => {
    // const hdrs = {
    //   'Content-Type': 'application/json',
    //   Authorization: 'Bearer ' + localStorage.getItem('token')
    // };
    fetch(
      // '/api/me',
      '/api/questions',
      {
        method: 'GET',
        headers: authenticationService.authHeader(),
      }
    ).then(
      resp => {
        console.log('resp:', resp);
        return resp.json();
      }
    ).then(
      data => console.log('question data:', data)
    )
  }

  render() {
    return(<div>
      <h1>Day {this.props.day}</h1>
      <p>Placeholder question content.</p>
    </div>);
  }
}

const DayQuestion = () => {
  const { day } = useParams();
  const dayNum = parseInt(day, 10);
  const isValidDate = !isNaN(dayNum) && dayNum > 0 && dayNum <= 25;

  return isValidDate ? <DayComponent day={dayNum} /> : <FourOhFour/>;
}

export default DayQuestion;

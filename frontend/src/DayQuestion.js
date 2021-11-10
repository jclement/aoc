import React from 'react';
import FourOhFour from './FourOhFour';
import {
  // useHistory,
  useParams
} from 'react-router-dom';

class DayComponent extends React.Component {
  render = () => (<div>
    <h1>Day {this.props.day}</h1>
    <p>Placeholder question content.</p>
  </div>);
}

const DayQuestion = () => {
  const { day } = useParams();
  const dayNum = parseInt(day, 10);
  const isValidDate = !isNaN(dayNum) && dayNum > 0 && dayNum <= 25;

  return isValidDate ? <DayComponent day={dayNum} /> : <FourOhFour/>;
}

export default DayQuestion;

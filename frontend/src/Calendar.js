import React from 'react';
import { Link } from 'react-router-dom';

class CalDay extends React.Component {
  render = () => {
    if (this.props.day < 1) { return (<td/>); }
    return (<td>
      <Link to={`/calendar/${this.props.day}`}>
        {`Day ${this.props.day}`}
      </Link>
    </td>);
  };
}

class CalWeek extends React.Component {
  renderDay = (i) => {
    return (<CalDay
      day={this.props.weekStart + i}
      key={this.props.weekStart + i}
    />);
  }

  render() {
    return (<tr>
      {[0,1,2,3,4,5,6].map(this.renderDay)}
    </tr>);
  }
}

class CalendarComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentDay: 0
    };
  }

  componentDidMount() {
  }

  renderWeek = (wk, i) => (<CalWeek key={wk} weekStart={wk}/>);

  render() {
    const weekStarts = [-2, 5, 12, 19];

    return (<table>
      <tbody>
        {weekStarts.map(this.renderWeek)}
      </tbody>
    </table>);
  }
}

const Calendar = () => (<CalendarComponent />);

export default Calendar;

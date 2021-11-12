import React from 'react';
import './Calendar.css';
import { useNavigate } from 'react-router-dom';

class CalDay extends React.Component {
  goToDay = () => this.props.fnNav(`/calendar/${this.props.day}`);

  render = () => {
    if (this.props.day < 1) { return (<div className="col"/>); }
    return (<div className="col day" onClick={this.goToDay}>
      <span className="display-6">{this.props.day}</span>
    </div>);
  };
}

class CalWeek extends React.Component {
  renderDay = i => (<CalDay
    day={this.props.weekStart + i}
    key={this.props.weekStart + i}
    fnNav={this.props.fnNav}
  />)

  render() {
    return (<div className="row">
      {[0,1,2,3,4,5,6].map(this.renderDay)}
    </div>);
  }
}

class DayOfWeek extends React.Component {
  render = () => (<div className="col dayOfWeek">
    <b>{this.props.d}day</b>
  </div>)
}

class CalendarComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { currentDay: 0 };
  }

  renderWeek = (wk, i) => (<CalWeek key={wk} weekStart={wk} fnNav={this.props.fnNav}/>);

  render() {
    const weekStarts = [-2, 5, 12, 19];

    return (<div id="cal" className="container">
      <div className="row">
        <DayOfWeek d="Sun"/>
        <DayOfWeek d="Mon"/>
        <DayOfWeek d="Tues"/>
        <DayOfWeek d="Wednes"/>
        <DayOfWeek d="Thurs"/>
        <DayOfWeek d="Fri"/>
        <DayOfWeek d="Satur"/>
      </div>
      {weekStarts.map(this.renderWeek)}
    </div>);
  }
}

class CalendarWrapper extends React.Component {
  render = () => (<div className="App">
    <div className="text-center display-2">December</div>
    <br/>
    <CalendarComponent fnNav={this.props.fnNav}/>
  </div>);
}

const Calendar = () => (<CalendarWrapper fnNav={useNavigate()}/>);

export default Calendar;

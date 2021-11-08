import React from 'react';

class CalDay extends React.Component {
  render = () => (<td>
    {(this.props.day < 1) ? ' ' : this.props.day}
  </td>);
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

class Calendar extends React.Component {
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

export default Calendar;

import React from 'react';
import Header from './Header';
import './App.css';

export default class Leaderboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: []
    };
  }
  componentDidMount() {
    fetch('/api/leaderboard')
      .then(response => response.json())
      .then(data => this.setState({'data': data}))
  }
  headers = (<thead>
    <tr>
      <th>Name</th>
      <th>Score</th>
    </tr>
  </thead>)
  renderRow = (row, index) => (<tr key={row.user_id}>
    <td>{row.username}</td>
    <td>{row.score}</td>
  </tr>)
  render = () => (<div className="App">
    <Header>Really Lame Leaderboard</Header>
    <table className="table">
      {this.headers}
      <tbody>
        {this.state.data.map(this.renderRow)}
      </tbody>
    </table>
  </div>)
}

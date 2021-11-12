import React from 'react';
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
  render = () => {
    return (<div className="App">
      <h1>Really Really Lame Leaderboard</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {this.state.data.map((row,index) => <tr key={row.user_id}>
            <td>{row.username}</td>
            <td>{row.score}</td>
          </tr>)}
        </tbody>
      </table>
    </div>);
  }
}

import React from 'react';

class Leaderboard extends React.Component {
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
    render() {
      return <table><tbody>
          <tr><th>Name</th><th>Score</th></tr>
              {this.state.data.map((row,index) => <tr key={row.user_id}>
              <td>{row.username}</td>
              <td>{row.score}</td>
                  </tr>)}
      </tbody></table>
    }
}

export default Leaderboard
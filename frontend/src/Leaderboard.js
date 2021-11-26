import React from "react";
import "./App.css";

export default class Leaderboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: []
    };
  }
  componentDidMount() {
    fetch("/api/leaderboard")
      .then((response) => response.json())
      .then((data) => this.setState({ data: data }));
  }
  headers = (
    <thead>
      <tr>
        <th scope="col">Name</th>
        <th scope="col" className="text-end">Score</th>
      </tr>
    </thead>
  );
  renderRow = (row, index) => (
    <tr
      className={row.user_id === this.props.user?.id ? "table-info" : ""}
      key={row.user_id}
    >
      <td>
        <img
          className="userIcon"
          src={`https://robots.adventofquorum.org/${row.user_id}.png?size=50x50`}
          alt={row.username}
        />
        &nbsp;
        {row.is_admin ? <span className="badge rounded-pill bg-dark">admin</span>:""}
        &nbsp;{row.username}&nbsp;
      </td>
      <td className="text-end">{row.score.toLocaleString("en-US")}</td>
    </tr>
  );
  render = () => (
    <div className="App">
      <table className="table table-striped table-sm">
        {this.headers}
        <tbody>{this.state.data.map(this.renderRow)}</tbody>
      </table>
    </div>
  );
}

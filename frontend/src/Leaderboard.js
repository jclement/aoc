import React from "react";
import { Header } from "./Styling";
import "./App.css";

export default class Leaderboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
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
        <th scope="col">Score</th>
      </tr>
    </thead>
  );
  renderRow = (row, index) => (
    <tr
      className={row.user_id === this.props.user?.id ? "table-info" : ""}
      key={row.user_id}
    >
      <td scope="row">
        <img
          className="userIcon"
          src={`https://robohash.org/${row.user_id}.png?size=50x50`}
          alt={row.username}
        />
        &nbsp;&nbsp;{row.username}
      </td>
      <td>{row.score}</td>
    </tr>
  );
  render = () => (
    <div className="App">
      <Header>Robot Leaderboard</Header>
      <table className="table table-striped table-sm">
        {this.headers}
        <tbody>{this.state.data.map(this.renderRow)}</tbody>
      </table>
    </div>
  );
}

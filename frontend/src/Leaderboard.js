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
          src={`https://robots.adventofqode.org/${row.user_id}.png?size=50x50`}
          alt={row.username}
        />
        &nbsp;
        {row.is_admin ? <span className="badge rounded-pill bg-dark">admin</span>:""}
        &nbsp;
        {this.props.user?.is_admin && <a href={"mailto:" + row.email}>{row.username}</a>}
        {!this.props.user?.is_admin && <span>{row.username}</span>}
        {row.fav_points > 0 && <span style={{margin: "5px"}} className="badge rounded-pill bg-danger">{row.fav_points} <i className="fas fa-heart"></i></span>}
        &nbsp;
      </td>
      <td className="text-end">{row.score.toLocaleString("en-US")}</td>
    </tr>
  );
  render = () => (
    <div className="App">
      <table className="table table-striped table-sm leaderboard">
        {this.headers}
        <tbody>{this.state.data.map(this.renderRow)}</tbody>
      </table>
    </div>
  );
}

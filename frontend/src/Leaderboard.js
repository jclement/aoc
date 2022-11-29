import React from "react";
import "./App.css";
import { Link } from "react-router-dom";
import VerifiedCheck from "./VerifiedCheck";
import { authenticationService } from './_services/authentication.service';

export default class Leaderboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: []
    };
  }
  componentDidMount() {
    authenticationService.httpGet('/api/leaderboard')
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
  cacheBonusImage = imgUrl => window.setTimeout(
    () => this.props.cacheBonusImage(imgUrl),
    100
  );
  renderRow = (row, index) => {
    if (!this.props.userBonusImage && row.user_id === this.props.user?.id) {
      this.cacheBonusImage(row.bonus_image || true);
    }
    return (
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
          {row.is_admin ? <span className="badge rounded-pill bg-dark">admin</span> : ""}
          {row.is_admin ? <VerifiedCheck /> : null}
          &nbsp;
          {this.props.user?.is_admin && <a data-bonusimg={row.bonus_image} href={"mailto:" + row.email}>{row.username}</a>}
          {!this.props.user?.is_admin && <span data-bonusimg={row.bonus_image}>{row.username}</span>}
          {row.fav_points > 0 && <span style={{margin: "5px"}} className="badge rounded-pill bg-danger">{row.fav_points} <i className="fas fa-heart"></i></span>}
          &nbsp;
        </td>
        <td className="text-end">{row.score.toLocaleString("en-US")}</td>
      </tr>
    );
  };
  render = () => (
    <div className="App">
      <table className="table table-striped table-sm leaderboard">
        {this.headers}
        <tbody>{this.state.data.map(this.renderRow)}</tbody>
      </table>
    </div>
  );
}

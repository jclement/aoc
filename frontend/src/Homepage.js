import React from "react";
import Leaderboard from "./Leaderboard";
import QuestionList from "./QuestionList";
import Intro from "./Intro";
import "./App.css";

export default class Homepage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
    };
  }
  render = () => (<div>
    {!this.props.user && <div>
      <h1>Advent of Quorum Leaderboard</h1>
      <Leaderboard user={this.props.user} />
    </div>}
    {this.props.user && <div className="container-fluid">
      <div className="row row-cols-2">
        <div className="col-12 col-sm-12 col-md-8">
          <QuestionList />
          <div className="d-none d-sm-none d-md-block"><Intro /></div>
        </div>
        <div className="col-12 col-sm-12 col-md-4">
          <Leaderboard user={this.props.user} />
        </div>
      </div>
    </div>}
  </div>);
}

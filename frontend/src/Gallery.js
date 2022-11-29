import React from "react";
import "./App.css";
import { Link } from "react-router-dom";
import VerifiedCheck from "./VerifiedCheck";
import { authenticationService } from './_services/authentication.service';

class UserImage extends React.Component {
  render() {
    return (<div className="gallery-thumbnail p-3 m-2 text-center">
      <div className="font-monospace pb-3">
        <span>{this.props.user.username}</span>
        {this.props.user.is_admin ? <VerifiedCheck /> : null}
      </div>
      <div>
        <a href={this.props.user.bonus_image} target="_blank">
          <img
            src={this.props.user.bonus_image}
            className="mugshot"
            alt={this.props.user.username}
            title={'Score: ' + (this.props.user.score + this.props.user.fav_points).toString()} />
        </a>
      </div>
    </div>);
  }
}

export default class Gallery extends React.Component {
  constructor(props) {
    super(props);
    this.state = { participants: [] };
  }

  componentDidMount() {
    authenticationService.httpGet('/api/leaderboard')
      .then((response) => response.json())
      .then((data) => this.setState({ participants: data }));
  }

  hasImage = user => (!!user.bonus_image)

  renderUser = user => (<UserImage user={user} key={user.user_id}/>)

  render() {
    return (<div className="row">
      <div className="col-12 mb-5">
        <h2 className="text-center">A Better Look at The Bad Baker's Dozen:</h2>
      </div>
      <div className="col-12 col-md-12">
        <div className="d-flex flex-wrap">
          {this.state.participants.filter(this.hasImage).map(this.renderUser)}
        </div>
      </div>
    </div>)
  }
}

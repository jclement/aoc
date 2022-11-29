import React from "react";
import "./App.css";
import VerifiedCheck from "./VerifiedCheck";
import { authenticationService } from './_services/authentication.service';

class UserImage extends React.Component {
  highlightSelf = () => 'pb-3 flex-fill' + (this.props.ownUser.id === this.props.user.user_id ? ' bg-secondary' : '');

  render() {
    return (<div className={this.highlightSelf()}>
      <div className="gallery-thumbnail text-center">
        <div className="font-monospace pb-1">
          <span>{this.props.user.username}</span>
          <VerifiedCheck user={this.props.user} />
        </div>
        <div>
          <a href={this.props.user.bonus_image} target="_blank" rel="noreferrer">
            <img
              className="mugshot"
              loading="lazy"
              src={this.props.user.bonus_image}
              alt={this.props.user.username}
              title={'Score: ' + (this.props.user.score + this.props.user.fav_points).toString()}  />
          </a>
        </div>
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

  renderUser = user => (<UserImage user={user} ownUser={this.props.user} key={user.user_id}/>)

  render() {
    return (<div className="row">
      <div className="col-12 mb-5">
        <h2 className="text-center">A Better Look at The Bad Baker's Dozen:</h2>
      </div>
      <div className="col-12">
        <div className="d-flex align-items-start flex-wrap">
          {this.state.participants.filter(this.hasImage).map(this.renderUser)}
        </div>
      </div>
    </div>)
  }
}

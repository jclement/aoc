import React from "react";
import { ButtonBar } from './Styling';
import { popError, popSuccess } from './handleError';
import { authenticationService } from "./_services/authentication.service";

class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      id: props.user.id,
      email: props.user.email,
      username: props.user.username,
      error: ""
    };
  }

  onUsernameChange(event) {
    this.setState({
      username: event.target.value,
    });
  }

  onSubmit(event) {
    authenticationService
      .httpPut("/api/me", { username: this.state.username })
      .then((response) => response.json())
      .then((data) => {
        if (data.result) {
          authenticationService.refreshUser();
          popSuccess("Your profile has been updated.");
        } else {
          this.setState({
            //error: data.message,
            username: this.props.user.username,
          });
          popError("Nope! " + data.message);
        }
      });
    event.preventDefault();
    event.stopPropagation();
    return true;
  }

  profilePicUrl = () => {
    if (typeof(this.props.userBonusImage) === 'string') {
      return this.props.userBonusImage;
    }
    return `https://robots.adventofqode.org/${this.props.user.id}.png?size=150x150`;
  }

  render = () => (
    <div>
      <div>
        <center>
          <img
            src={this.profilePicUrl()}
            alt={this.props.user.username}
          />
        </center>
        <form>
          <div className="row mb-3">
            <label htmlFor="inputEmail" className="col-sm-2 col-form-label">
              Email Address:
            </label>
            <div className="col-sm-10">
              <input
                type="email"
                className="form-control"
                id="inputEmail"
                value={this.state.email}
                disabled
              />
            </div>
          </div>
          <div className="row mb-3">
            <label htmlFor="inputUsername" className="col-sm-2 col-form-label">
              Username:
            </label>
            <div className="col-sm-10">
              <input
                type="text"
                maxLength="50"
                className="form-control"
                onChange={this.onUsernameChange.bind(this)}
                value={this.state.username}
                id="inputPassword3"
              />
            </div>
          </div>
          {this.state.error ? (
            <div className="alert alert-danger">
              <b>Denied!</b> {this.state.error}
            </div>
          ) : (
            ""
          )}
          <ButtonBar>
            <button
              type="submit"
              onClick={this.onSubmit.bind(this)}
              className="btn btn-primary">Update Profile</button>
          </ButtonBar>
        </form>
      </div>
    </div>
  );
}

export default Profile;

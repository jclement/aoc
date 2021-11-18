import React from 'react';
import { authenticationService } from './_services/authentication.service';

class Profile extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
        id: props.user.id,
        email: props.user.email,
        username: props.user.username,
    };
  }

  onUsernameChange(event) {
      this.setState({
          username: event.target.value
      });
  }

  onSubmit(event) {
      authenticationService.updateProfile(this.state.username);
      event.preventDefault();
      event.stopPropagation();
      return true;
  }

  render = () => (<div>
      <div>
      <h1>Update Profile</h1>
      <form>
        <div className="row mb-3">
            <label htmlFor="inputEmail" className="col-sm-2 col-form-label">Email</label>
            <div className="col-sm-10">
            <input type="email" className="form-control" id="inputEmail" value={this.state.email} disabled />
            </div>
        </div>
        <div className="row mb-3">
            <label htmlFor="inputUsername" className="col-sm-2 col-form-label">Username</label>
            <div className="col-sm-10">
            <input type="text" maxLength="50" className="form-control" onChange={this.onUsernameChange.bind(this)} value={this.state.username} id="inputPassword3" />
            </div>
        </div>
        <button type="submit" onClick={this.onSubmit.bind(this)} className="btn btn-primary">Update</button>
        </form>
      </div> 
  </div>)
}

export default Profile

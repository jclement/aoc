import React from 'react';
import Header from './Header';
import { authenticationService } from './_services/authentication.service';
import { useSearchParams, useNavigate } from 'react-router-dom';

class LoginComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      email: '',
      email_sent: false,
      secret: '',
    };

    const [searchParams]= props.params;
    if (searchParams.has('email')) {
      this.state.email = searchParams.get('email');
      this.state.secret = searchParams.get('secret');
      this.state.email_sent = true;
    }
  }

  sendEmail(event) {

    fetch('/api/email_authenticate/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({"email": this.state.email })
    })
      .then(response => response.json())
      .then(data => {
        if (data.result) {
          this.setState({email_sent: true});
        } else {
          alert(data.message);
        }
      });

    event.preventDefault();
  }

  login(event) {

    fetch('/api/email_authenticate/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({"email": this.state.email, "secret": this.state.secret })
    })
      .then(response =>  {
        if (response.status === 401) {
          throw new Error("Unauthorized!")
        }
        return response.json()
      })
      .then(data => {
        if (data.access_token) {
          authenticationService.updateToken(data.access_token);
          this.props.navigate('/');
        }
      }, err => {
        alert(err)
      })

    event.preventDefault();
  }

  onEmailChange(event) {
    this.setState({email: event.target.value});
  }

  onSecretChange(event) {
    this.setState({secret: event.target.value});
  }

  render = () => (<div>
    <Header>Advent of Quorum 2021!</Header>
    { !this.state.email_sent ? 
      <div>
      <p>Enter your email address to login/sign-up:</p>
      <form id="email-form" onSubmit={this.sendEmail.bind(this)} method="POST">
      <div className="form-group">
          <label>Email address</label>
          <input type="email" value={this.state.email} onChange={this.onEmailChange.bind(this)} className="form-control" />
      </div>
      <button type="submit" className="btn btn-primary">Send Authentication Email</button>
      </form>
      </div> : 
      <div>
      <p>Enter the secret you received by email:</p>
      <form id="login-form" onSubmit={this.login.bind(this)} method="POST">
      <div className="form-group">
          <label>Email address</label>
          <input type="email" disabled value={this.state.email} onChange={this.onEmailChange.bind(this)} className="form-control" />
      </div>
      <div className="form-group">
          <label>Secret</label>
          <input type="text" value={this.state.secret} onChange={this.onSecretChange.bind(this)} className="form-control" />
      </div>
      <button type="submit" className="btn btn-primary">Authenticate!</button>
      </form>
      </div> 
    }

  </div>)
}

const Login = () => <LoginComponent params={useSearchParams()} navigate={useNavigate()}/>

export default Login

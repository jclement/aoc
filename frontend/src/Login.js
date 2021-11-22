import React from "react";
import { Header } from "./Styling";
import { authenticationService } from "./_services/authentication.service";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

class LoginComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      email_sent: false,
      secret: "",
    };

    const [searchParams] = props.params;
    if (searchParams.has("email")) {
      this.state.email = searchParams.get("email");
      this.state.secret = searchParams.get("secret");
      this.state.email_sent = true;
    }
  }

  sendEmail(event) {
    fetch("/api/email_authenticate/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: this.state.email }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.result) {
          this.setState({ email_sent: true});
        } else {
          toast(data.message, {theme: "colored", type:"error"});
        }
      });

    event.preventDefault();
  }

  login(event) {
    fetch("/api/email_authenticate/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: this.state.email,
        secret: this.state.secret,
      }),
    })
      .then((response) => {
        if (response.status === 401) {
          throw new Error("Unauthorized!");
        }
        return response.json();
      })
      .then(
        (data) => {
          if (data.access_token) {
            authenticationService.updateToken(data.access_token);
            this.props.navigate("/");
          }
        },
        (err) => {
          toast(err.message, {theme: "colored", type:"error"});
        }
      );

    event.preventDefault();
  }

  onEmailChange(event) {
    this.setState({ email: event.target.value });
  }

  onSecretChange(event) {
    this.setState({ secret: event.target.value });
  }

  render = () => (
    <div>
      <Header>Advent of Quorum 2021!</Header>
      {!this.state.email_sent && <p class="alert alert-dark">Enter your email address to sign-in/create an account.  An email will be sent to this address to authenticate you.</p>}
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
              onChange={this.onEmailChange.bind(this)}
              disabled={this.state.email_sent}
            />
          </div>
        </div>
        {this.state.email_sent && (
          <div>
            <div className="alert alert-success">
              A super secret authentication email has been sent to the supplied
              email address. Either copy-and-paste the code from that email into
              the box below, or click the link in the email and prove your
              identity!
            </div>
            <div className="row mb-3">
              <label htmlFor="inputSecret" className="col-sm-2 col-form-label">
                Secret Code:
              </label>
              <div className="col-sm-10">
                <input
                  type="text"
                  className="form-control"
                  onChange={this.onSecretChange.bind(this)}
                  value={this.state.secret}
                  id="inputSecret"
                />
              </div>
            </div>
          </div>
        )}
        {this.state.error ? (
          <div className="alert alert-danger">
            <b>Denied!</b> {this.state.error}
          </div>
        ) : (
          ""
        )}
        {!this.state.email_sent ? (
          <button
            type="submit"
            onClick={this.sendEmail.bind(this)}
            className="btn btn-primary"
          >
            Send Email
          </button>
        ) : (
          <button
            type="submit"
            onClick={this.login.bind(this)}
            className="btn btn-primary"
          >
            Login
          </button>
        )}
      </form>
    </div>
  );
}

const Login = () => (
  <LoginComponent params={useSearchParams()} navigate={useNavigate()} />
);

export default Login;

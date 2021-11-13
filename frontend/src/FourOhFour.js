import React from 'react';
import Header from './Header';
import { Link } from 'react-router-dom';

class LinkBack extends React.Component {
  fnBack = () => window.history.back();

  render = () => (<span className="link" onClick={this.fnBack}>
    {this.props.children}
  </span>);
}

class FourOhFour extends React.Component {
  render = () => (<div>
    <Header>Whoops!</Header>
    {this.props.msg ?
      (<p className="display-5"><b className="text-danger">{this.props.msg}</b></p>) :
      (<p>What are you doing at '{window.location.href}'?</p>)
    }
    <p>
      <Link to="/">Go home!</Link>
    </p>
    <p>Or <LinkBack>Go back</LinkBack>.</p>
  </div>)
}

export default FourOhFour;

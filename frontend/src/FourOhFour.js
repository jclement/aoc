import React from 'react';
import { Link } from 'react-router-dom';

class LinkBack extends React.Component {
  fnBack = () => window.history.back();

  render = () => (<span className="link" onClick={this.fnBack}>
    {this.props.children}
  </span>);
}

class FourOhFourComponent extends React.Component {
  render = () => (<div>
    <p>What are you doing at '{window.location.href}'?</p>
    <p>There's nothing here!</p>
    <p>
      <Link to="/">Go home!</Link>
    </p>
    <p>Or <LinkBack>Go back</LinkBack>.</p>
  </div>)
}

const FourOhFour = () => (<FourOhFourComponent />);

export default FourOhFour;

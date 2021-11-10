import React from 'react';

class GoBack extends React.Component {
  fnBack = () => window.history.back();

  render = () => (<span className="clickable" onClick={this.fnBack}>
    {this.props.children}
  </span>);
}

class FourOhFourComponent extends React.Component {
  render = () => (<div>
    <p>What are you doing at '{window.location.href}'?</p>
    <p>There's nothing here!</p>
    <p>Go home!</p>
    <p><GoBack>Going back</GoBack> works too.</p>
  </div>)
}

const FourOhFour = () => (<FourOhFourComponent />);

export default FourOhFour;

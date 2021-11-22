import React from 'react';

class Header extends React.Component {
  render = () => (<div>
    <div className="text-center display-2">{this.props.children}</div>
    <br/>
  </div>)
}

class ButtonBar extends React.Component {
  render = () => (<div className="d-grid gap-1 d-lg-flex justify-content-lg-end">
    {this.props.children}
  </div>)
}

export { Header, ButtonBar};

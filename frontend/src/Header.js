import React from 'react';

class Header extends React.Component {
  render = () => (<div>
    <div className="text-center display-2">{this.props.children}</div>
    <br/>
  </div>)
}

export default Header;

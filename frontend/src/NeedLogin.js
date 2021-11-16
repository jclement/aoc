import React from 'react';
import Header from './Header';

class NeedLoginComponent extends React.Component {
  render = () => (<div>
    <Header>Advent of Code 2021!</Header>
    <p className="text-center">Please log in.</p>
    <p className="text-center">Or sign up if you haven't already!</p>
  </div>)
}

const NeedLogin = () => (<NeedLoginComponent/>)

export default NeedLogin

import React from "react";
import { Header } from './Styling';

export default class Intro extends React.Component {
  render = () => (<div className="font-monospace">
    <Header>Welcome!</Header>
    <div className="text-center">
      <img src="https://robohash.org/robotprime.png?size=150x150" alt="Robot Prime"/>
    </div>

    <p><code>> ./a.out</code></p>

    <div className="upper">
      <p>HELLO RECRUIT!</p>
      <p>You are part of a new digital transformation initiative at the North Pole to roll out a high-tech fleet of robots to help clear the backlog created by disruptions to the global supply chain.  To support the holiday effort, you will be assigned a series of computational tasks.  Unfortunately, as everyone knows, elves hate robots and they are doing their best to sabotage your efforts.</p>
      <p>Are you up to the task? Joints oiled, batteries charged?</p>
      <p>Problems above in green are active and ready to be solved. Let's save Christmas!</p>
      <p>01000111 01101111 01101111 01100100 00100000 01001100 01110101 01100011 01101011 00100001</p>
    </div>

  </div>)
}

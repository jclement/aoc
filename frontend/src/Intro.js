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
      <p>Hey, wake up!</p>
      <p>It's nearly Christmas, and the elves are running late. It's up to us parts bin robots to save the day!</p>
      <p>You should know - the elves don't like us. We'll have to sort through their messes and work around the locks and obstacles they've thrown up. And they're only going to get crankier as it nears Christmas. Are you up to the task? Joints oiled, batteries charged?</p>
      <p>Problems above in green are still unsolved. Let's save Christmas!</p>
      <p>01000111 01101111 01101111 01100100 00100000 01001100 01110101 01100011 01101011 00100001</p>
    </div>

  </div>)
}

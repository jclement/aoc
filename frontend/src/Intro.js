import React from "react";
import { Header } from './Styling';

export default class Intro extends React.Component {
  render = () => (<div className="font-monospace">
    <Header>Welcome!</Header>
    <div className="text-center">
      <img width="300" src="https://upload.erraticbits.ca/inline/mYLB1D/RoboHorse3.png" alt="Horse Prime"/>
    </div>

    <div className="upper">
      <p>HELLO RECRUIT!</p>
      <p>The first true Calgary Stampede and Exhibition was held in 1912. As everyone knows, nothing screams computing power, logistics and technology quite like rodeo does. Since this inaugural stampede the call for technology and computational might has been great. In the early days, punch card calculating systems were employed for all of the many ballistic (think roping trajectories and projectile sheep) needs. The Calgary Stampede, always on the frontiers of technology, bought the first Univac purchased in Canada in 1951. It is still running to this day and to that end the Calgary Stampede has employed us (a band of Cowboy Robots) to help to revolutionize the computer processing needs of the Stampede and drag it kicking and screaming into the new century (ok so not so new, but new if you are running things on a UNIVAC).</p>
      <p>Welcome to the team.   Yeeeeehhhhaaaaww!</p>
      <p>-- Horse Prime</p>
    </div>

  </div>)
}

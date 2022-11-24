import React from "react";
import { Header } from './Styling';

export default class Intro extends React.Component {
  render = () => (<div className="font-monospace">
    <h3>Welcome to the Advent of Qode 2022</h3>
    <h4>Mars Attacks Christmas</h4>
    <p>The sanctitude of Christmas has yet again been threatened. This year the threat is Mars!</p>
    <p>For decades now, NASA has been sending probes to mars in search of life and other stuff. Martians apparantly see foreign probes as declarations of war. </p>
    <p>They have realized the way to conquer the planet is of course to take over Christmas!!!</p>
    <p>Santa has hired us, a <i>Rag Tag</i> group of robot mercenaries known as the "Bad Bakers Dozen".</p>
    <p>We are here and ready to kick some Martian butt.</p>
    <p>Your mission, should you choose to accept it, is to join the ranks of the "Bad Bakers Dozen", help defeat the Martian Invaders and Save Christmas!</p>
    <iframe width="560" height="315" src="https://www.youtube.com/embed/6Uw2UMvOuSQ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>)
}

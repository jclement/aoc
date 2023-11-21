import React from "react";
import { Header } from './Styling';

export default class Intro extends React.Component {
  render = () => (<div className="font-monospace">
    <h3>Welcome to the Advent of Qode 2023</h3>
    <h4>The Blob Eats Christmas</h4>
    <p>We need your help to save Christmas (and the Earth) from Sedrick, a mysterious creature formed from candy canes, maple syrup, and 1.21 gigawatts of electricity!</p>
    <iframe width="560" height="315" src="https://www.youtube.com/embed/A9rpjqb45Q4?si=ViOLoJ2HQPHG9y53" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
  </div>)
}

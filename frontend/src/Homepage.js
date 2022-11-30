import React from "react";
import Leaderboard from "./Leaderboard";
import QuestionList from "./QuestionList";
import Intro from "./Intro";
import "./App.css";
import Countdown from 'react-countdown';
import { parseToLocal } from './dateHandling';

export default class Homepage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
    };
  }
  timerComplete = () => {
    // I'm not proud of this.  It's lazy, but it causes page to redraw the way I'd like.
    setTimeout(() => {
      this.setState({'update': new Date()});
    }, 1000);
  }

  plural = n => (n > 1 ? 's' : '')
  wordify = (unit, n) => (n ? `${n} ${unit}${this.plural(n)}` : '')
  renderer = ({ days, hours, minutes, seconds, completed }) => {
    if (completed) {
      return (<span>Complete</span>);
    }
    return [
      this.wordify('day', days),
      this.wordify('hour', hours),
      this.wordify('minute', minutes),
      this.wordify('second', seconds)
    ].filter(s => !!s.length).join(' ');
  }

  render() {
    var startDate = parseToLocal(this.props.start_date);
    if (!this.props.start_date) {
      // empty system, not much we can show
      return <div>Nothing to see yet</div>;
    } else if (startDate > new Date() && !this.props.user?.is_admin) {
      // waiting for the first question to become active
      return (<div>
        <div className="center">
          <span id="countdown">
          <img src="/countdown.png" alt="countdown" className="img-fluid" />
            <h1>The adventure begins in ...</h1>
            <p>
              <Countdown
                date={startDate}
                renderer={this.renderer}
                onComplete={this.timerComplete} />
            </p>
          </span>
        </div>
        <br/>
        { this.props.user==null && <p className="alert alert-primary">Perhaps you should <a href="/login">Login</a> so that you can participate when the adventure begins?</p>}
      </div>);
    } else if (this.props.user) {
      return (<div className="container-fluid">
        <div className="row row-cols-2">
          <div className="col-12 col-sm-12 col-md-8">
            <QuestionList />
            <div className="d-none d-sm-none d-md-block">
              <Intro />
            </div>
          </div>
          <div className="col-12 col-sm-12 col-md-4">
            <Leaderboard
              user={this.props.user}
              userBonusImage={this.props.userBonusImage}
              cacheBonusImage={this.props.cacheBonusImage} />
          </div>
        </div>
      </div>);
    } else {
      return <div>
        <p className="alert alert-primary">Perhaps you wish to <a href="/login">Login</a> so you can participate in the fun?</p>
      </div>
    }
  }
}

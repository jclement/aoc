import React from 'react';
import './App.css';
import './Question.css';
import { authenticationService } from './_services/authentication.service';
import { Link } from "react-router-dom";
import { parseToLocal } from "./dateHandling";
import Countdown from 'react-countdown';

// todo: indicator of whether you answered it (participated)

class QuestionListComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { questions: [] };
  }

  componentDidMount = () => {
    authenticationService.httpGet(
      '/api/questions'
    ).then(
      resp => resp.json()
    ).then(
      data => this.setState({ questions: data.reverse() })
    );
  }

  namedStatus = question => (Date.now() > parseToLocal(question.deactivate_date) ? 'Complete' : 'Inactive')

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

  renderQuestionCard = question => (
    <tr key={question.id} className={question.is_active ? "table-success" : ""}>
      <td><Link to={"question/" + question.id}>{question.title}</Link></td>
      <td>{
        question.is_active ?
          <Countdown
            date={parseToLocal(question.deactivate_date)}
            renderer={this.renderer} /> :
          <span>{this.namedStatus(question)}</span>
      }</td>
    </tr>);

  render = () => (
    <table className="table table-striped">
      <thead><tr><th>Question</th><th>Status</th></tr></thead>
      <tbody>
        {this.state.questions.map(this.renderQuestionCard)}
      </tbody>
    </table>
  );
}

const QuestionList = () => (<QuestionListComponent />);

export default QuestionList;

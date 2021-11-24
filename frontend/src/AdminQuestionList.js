import React from 'react';
import './App.css';
import './Question.css';
import { authenticationService } from './_services/authentication.service';
import { Link } from "react-router-dom";
import {fromUtc, parseToLocal} from "./dateHandling";
import Countdown from 'react-countdown';

// todo: indicator of whether you answered it (participated)

class AdminQuestionListComponent extends React.Component {
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

  namedStatus = question => (Date.now() > Date.parse(question.deactivate_date) ? 'Complete' : 'Inactive')

  renderQuestionCard = question => (
    <tr key={question.id}>
      <td><Link to={question.id}>{question.title}</Link></td>
      <td>{
        question.is_active ?
          <Countdown date={parseToLocal(question.deactivate_date)}>
            <span>Inactive</span>
          </Countdown> :
          this.namedStatus(question)
      }</td>
      <td>{fromUtc(question.activate_date)}</td>
      <td>{fromUtc(question.deactivate_date)}</td>
    </tr>);

  render = () => (
    <table className="table table-striped">
      <thead><tr><th>Question</th><th>Status</th><th>Activation Date</th><th>Deactivation Date</th></tr></thead>
      <tbody>
        {this.state.questions.map(this.renderQuestionCard)}
      </tbody>
    </table>
  );
}

const QuestionList = () => (<AdminQuestionListComponent />);

export default QuestionList;

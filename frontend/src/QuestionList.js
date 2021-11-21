import React from 'react';
import './App.css';
import './Question.css';
import { authenticationService } from './_services/authentication.service';
import { Link } from "react-router-dom";

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

  roundedNumDays = question => {
    const daysLeft = (Date.parse(question.deactivate_date)-Date.now()) / (1000*60*60*24);
    return Math.round(100 * daysLeft) / 100;
  }
  daysRemaining = question => (`${this.roundedNumDays(question)} days remaining`)

  namedStatus = question => (Date.now() > Date.parse(question.deactivate_date) ? "Complete" : "Inactive")

  renderQuestionCard = question => (
    <tr key={question.id} className={question.is_active ? "table-success" : ""}>
      <td><Link to={"question/" + question.id}>{question.title}</Link></td>
      <td>{question.is_active ? this.daysRemaining(question) : this.namedStatus(question)}</td>
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

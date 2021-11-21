import React from 'react';
import './App.css';
import './Question.css';
import QuestionCard from "./QuestionCard";
import { Outlet } from 'react-router-dom';
import { authenticationService } from './_services/authentication.service';

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
      data => this.setState({ questions: data })
    );
  }

  renderQuestionCard = question => (<QuestionCard
    key={question.id}
    question={question}
    pathPrefix="questions"/>)

  render = () => (<div className="row question-sidebar">
    <div className="col-md-3">
      <nav className="nav nav-pills nav-tabs flex-column">
        {this.state.questions.map(this.renderQuestionCard)}
      </nav>
    </div>
    <div className="col-md-9">
      <Outlet/>
    </div>
  </div>);
}

const QuestionList = () => (<QuestionListComponent />);

export default QuestionList;

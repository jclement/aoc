import React from 'react';
import './Question.css';
import QuestionCard from "./QuestionCard";
import { Outlet } from 'react-router-dom';
import { authenticationService } from './_services/authentication.service';

class QuestionEditListComponent extends React.Component {
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
    pathPrefix="editquestion" />)

  render = () => (<main>
    <div className="row question-sidebar">
      <div className="col-md-3">
        <div className="nav nav-pills nav-tabs flex-column">
          {this.state.questions.map(this.renderQuestionCard)}
        </div>
      </div>
      <div className="col-md-9">
        <Outlet/>
      </div>
    </div>
  </main>)
}

const QuestionEditList = () => (<QuestionEditListComponent />)

export default QuestionEditList;

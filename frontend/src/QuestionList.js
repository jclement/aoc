import React from 'react';
import './App.css';
import { Outlet, useNavigate } from 'react-router-dom';
import { authenticationService } from './_services/authentication.service';

// todo: indicator of whether you answered it (participated)
class QuestionCard extends React.Component {
  isAvailable = () => (this.props.question.is_active && this.props.question.is_visible)

  getClass = () => {
    let cls = 'list-group-item card ';
    if (this.props.question.is_visible) {
      cls += 'clickable '
    }
    return cls + (this.props.question.is_active ? 'text-dark bg-light' : 'text-white bg-secondary');
  }

  showQuestion = () => this.props.fnNav(`/questions/${this.props.question.id}`)

  render = () => {
    return (<li
      className={this.getClass()}
      onClick={this.props.question.is_visible ? this.showQuestion : () => {}}>
      <div className="card-header">
        {this.props.question.is_visible ?
          (<b>{this.props.question.title}</b>) :
          (<b className="text-white-50">{this.props.question.title}</b>)
        }
      </div>
    </li>);
  }
}

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
    fnNav={this.props.fnNav}/>)

  render = () => (<main>
    <div className="row">
      <div className="col-md-3">
        <div className="list-group">
          {this.state.questions.map(this.renderQuestionCard)}
        </div>
      </div>
      <div className="col-md-9">
        <Outlet/>
      </div>
    </div>
  </main>);
}

const QuestionList = () => (<QuestionListComponent fnNav={useNavigate()}/>);

export default QuestionList;

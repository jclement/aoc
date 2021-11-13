import React from 'react';
import ReactMarkdown from 'react-markdown';
import FourOhFour from './FourOhFour';
import Header from './Header';
import { useParams } from 'react-router-dom';
import { authenticationService } from './_services/authentication.service';

class AnswerText extends React.Component {
  render = () => (<input
    type="text"
    className="form-control"
    placeholder="Your Answer"
    value={this.props.answer}
    onChange={this.props.updateAnswer} />)
}

class AnswerBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { answer: '' };
  }

  // todo: fetch correct answer on past questions

  submitAnswer = evt => {
    evt.preventDefault();
    this.props.submitAnswer(this.state.answer);
  }

  updateAnswer = evt => this.setState({ answer: evt.target.value })

  allowSubmit = () => (this.state.answer && this.state.answer.length) ? true : false

  renderPastAnswer = () => (<input
    type="text"
    className="form-control"
    value={`Your Answer: ${this.props.prevAnswer}`}
    disabled />)

  render() {
    return (<form onSubmit={this.submitAnswer}>
      <div className="input-group">
        {this.props.question.is_active ?
          <AnswerText answer={this.state.answer} updateAnswer={this.updateAnswer} /> :
          this.renderPastAnswer()
        }
        {
          (this.props.question.is_active && this.allowSubmit()) ?
            (<button type="submit" className="btn btn-primary">Submit</button>) :
            null
        }
      </div>
    </form>);
  }
}

class QuestionComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      question: null,
      failedMessage: null,
      prevAnswer: '',
      doneFetches: false
    };
  }

  // todo: use these
  fetchQuestionTags = () => { }
  fetchPrevAnswer = () => { }

  fetchQuestion = () => {
    fetch(
      `/api/questions/${this.props.day}`,
      {
        method: 'GET',
        headers: authenticationService.authHeader(),
      }
    ).then(
      resp => {
        if (!resp.ok) {
          throw new Error(`${resp.status} - ${resp.statusText}`);
        } else {
          return resp.json();
        }
      }
    ).then(
      data => this.setState({
        question: data,
        failedMessage: null,
        prevAnswer: ''
      })
    ).catch(
      error => this.setState({ failedMessage: error.message })
    );

    return (<Header>Please Wait...</Header>);
  }

  submitAnswer = answer => {
    if (!answer) { return; }

    const ans = answer.trim();
    if (!ans.length) { return; }

    alert(`fake send answer '${ans}'`);
  }

  render() {
    if (!this.state.failedMessage) {
      if (this.state.question) {
        if (this.state.question.id !== this.props.day) {
          return this.fetchQuestion();
        }
      } else {
        return this.fetchQuestion();
      }
    } else {
      return (<FourOhFour msg={this.state.failedMessage}/>);
    }

    const question = this.state.question;
    return (<div>
      <div className={`card${question.is_active ? '' : ' text-white bg-secondary'}`}>
        <div className="card-body">
          <h1 className="card-title">{question.title}</h1>
          <br/>
          <div className="card-text">
            <ReactMarkdown>{question.body}</ReactMarkdown>
          </div>
        </div>
      </div>
      <br/>
      <AnswerBox
        submitAnswer={this.submitAnswer}
        question={question}
        prevAnswer={this.state.prevAnswer} />
    </div>);
  }
}

const Question = () => {
  const { day } = useParams();
  return (<QuestionComponent day={day}/>);
}

export default Question;

import React from 'react';
import ReactMarkdown from 'react-markdown';
import FourOhFour from './FourOhFour';
import Header from './Header';
import { useParams } from 'react-router-dom';
import { authenticationService } from './_services/authentication.service';

class WaitHeader extends React.Component {
  render = () => (<Header>Please Wait...</Header>)
}

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
    this.state = { answer: null };
  }

  submitAnswer = evt => {
    evt.preventDefault();
    this.props.submitAnswer(this.state.answer);
  }

  updateAnswer = evt => this.setState({ answer: evt.target.value })

  allowSubmit = () => (this.state.answer && this.state.answer.length) ? true : false

  renderNonEditableAnswer = () => (<input
    type="text"
    className="form-control"
    value={`Your Answer: ${this.props.answer || '---'}`}
    disabled />)

  render() {
    return (<form onSubmit={this.submitAnswer}>
      <div className="input-group">
        {this.props.question.is_active ?
          <AnswerText
            answer={this.state.answer || this.props.prevAnswer}
            updateAnswer={this.updateAnswer} /> :
          this.renderNonEditableAnswer()
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

// todo: render tags
// todo: maybe don't setState each time a response comes back

class QuestionComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      question: null,
      failedMessage: null,
      prevAnswer: '',
      expectedAnswer: null,
      tags: [],
    };
  }

  fetching = false

  handleError = error => {
    this.setState({ failedMessage: error.message });
    this.fetching = false;
  }

  fetchCorrectResponse = () => {
    if (this.state.question.is_active) {
      this.fetching = false;
    } else {
      authenticationService.httpGet(
        `/api/questions/${this.props.day}/answer`
      ).then(
        resp => resp.json()
      ).then(
        data => {
          if (data) {
            this.setState(
              { expectedAnswer: data.answer },
              () => this.fetching = false
            )
          } else {
            this.fetching = false;
          }
        }
      ).catch(this.handleError);
    }
  }

  fetchPrevResponse = () => {
    authenticationService.httpGet(
      `/api/questions/${this.props.day}/response`
    ).then(
      resp => resp.json()
    ).then(
      data => {
        if (data) {
          this.setState(
            {
              prevAnswer: data.response,
              tags: data.tags,
            },
            () => this.fetchCorrectResponse()
          )
        } else {
          this.fetchCorrectResponse();
        }
      }
    ).catch(this.handleError);
  }

  fetchQuestion = () => {
    this.fetching = true
    authenticationService.httpGet(
      `/api/questions/${this.props.day}`
    ).then(
      resp => {
        if (!resp.ok) {
          throw new Error(`${resp.status} - ${resp.statusText}`);
        } else {
          return resp.json();
        }
      }
    ).then(
      data => this.setState(
        {
          expectedAnswer: null,
          question: data,
          failedMessage: null,
          prevAnswer: '',
        },
        this.fetchPrevResponse
      )
    ).catch(this.handleError);

    return (<WaitHeader/>);
  }

  submitAnswer = answer => {
    if (!answer) { return; }

    const ans = answer.trim();
    if (!ans.length) { return; }

    authenticationService.httpPost(
      `/api/questions/${this.props.day}/response`,
      {
        response: ans,
        tags: []  // todo: some real tags
      }
    ).then(
      resp => resp.json()
    ).then(
      () => this.setState({
        question: null,
        prevAnswer: '',
        failedMessage: null,
        tags: []
      })
    ).catch(this.handleError);
  }

  initFetchQuestion = () => {
    if (!this.fetching) {
      this.fetchQuestion();
    }
    return (<WaitHeader />);
  }

  render() {
    if (!this.state.failedMessage) {
      if (this.state.question) {
        if (this.state.question.id !== this.props.day) {
          return this.initFetchQuestion();
        }
      } else {
        return this.initFetchQuestion();
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

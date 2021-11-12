import React from 'react';
import ReactMarkdown from 'react-markdown';
import FourOhFour from './FourOhFour';
import Header from './Header';
import {
  useParams
} from 'react-router-dom';
import { authenticationService } from './_services/authentication.service';

class AnswerBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { answer: '' };
  }

  submitAnswer = evt => {
    evt.preventDefault();
    this.props.submitAnswer(this.state.answer);
  }

  updateAnswer = evt => this.setState({ answer: evt.target.value })

  allowSubmit = () => (this.state.answer && this.state.answer.length) ? true : false

  render() {
    return (<form onSubmit={this.submitAnswer}>
      <div className="input-group">
        <input
          type="text"
          className="form-control"
          placeholder="Your Answer"
          value={this.state.answer}
          onChange={this.updateAnswer}/>
        {
          this.allowSubmit() ?
            (<button type="submit" className="btn btn-primary">Submit</button>) :
            null
        }
      </div>
    </form>);
  }
}

class DayComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      question: null,
    };
  }

  debug_settleQuestion = quesData => {
    this.setState({ question: quesData });
  }
  getQuestion = quesId => {
    const fakeQuestion = {
      title: `Fake Question ${quesId}`,
      activate_date: '2021-10-12T07:11:39.405Z',
      deactivate_date: '2021-12-12T07:11:39.405Z',
      body: `**This is markdown!** *Any idea how we're going to serve images?*

The component is called [react-markdown](https://remarkjs.github.io/react-markdown/) (MIT License)

And point form:
- Lorem
- Ipsum
- Dolor
- Sit
- Amet

(I haven't tested this component with code samples yet)`,
      is_active: true,
      is_visible: true
    };
    window.setTimeout(
      () => this.debug_settleQuestion(fakeQuestion),
      1500
    )
  }

  debug_fetchQuestion = () => {
    // const hdrs = {
    //   'Content-Type': 'application/json',
    //   Authorization: 'Bearer ' + localStorage.getItem('token')
    // };
    fetch(
      // '/api/me',
      '/api/questions',
      {
        method: 'GET',
        headers: authenticationService.authHeader(),
      }
    ).then(
      resp => {
        console.log('resp:', resp);
        return resp.json();
      }
    ).then(
      data => console.log('question data:', data)
    );
  }

  componentDidMount = () => {
    this.debug_fetchQuestion();

    this.getQuestion(this.props.day);
  }

  submitAnswer = answer => {
    if (!answer) { return; }

    const ans = answer.trim();
    if (!ans.length) { return; }

    alert(`fake send answer '${ans}'`);
  }

  render() {
    if (!this.state.question) {
      return (<Header>Processing...</Header>);
    }

    const question = this.state.question;
    if (!question.is_active || !question.is_visible) {
      return (<div>
        <Header>Nuh-uh</Header>
        <p>Question {this.props.day} is unavailable.</p>
      </div>);
    }

    return (<div>
      <Header>Day {this.props.day}</Header>
      <div className="card">
        <div className="card-body">
          <h1 className="card-title">{question.title}</h1>
          <br/>
          <div className="card-text">
            <ReactMarkdown>{question.body}</ReactMarkdown>
          </div>
        </div>
      </div>
      <br/>
      <AnswerBox submitAnswer={this.submitAnswer}/>
    </div>);
  }
}

const DayQuestion = () => {
  const { day } = useParams();
  const dayNum = parseInt(day, 10);
  const isValidDate = !isNaN(dayNum) && dayNum > 0 && dayNum <= 25;

  return isValidDate ? <DayComponent day={dayNum} /> : <FourOhFour/>;
}

export default DayQuestion;

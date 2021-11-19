import React from 'react';
import ReactMarkdown from 'react-markdown';
import FourOhFour from './FourOhFour';
import Header from './Header';
import Tagger from './Tagger';
import { useParams } from 'react-router-dom';
import { authenticationService } from './_services/authentication.service';

class WaitHeader extends React.Component {
  render = () => (<Header>Please Wait...</Header>)
}

class ExpectedAnswer extends React.Component {
  render() {
    if (!this.props.expectedAnswer) {
      return null;
    }
    return (<p>Expected Answer: <b className="text-light">{this.props.expectedAnswer}</b></p>);
  }
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
    this.state = { answer: '' };
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

  componentDidUpdate = (prevProps, prevState) => {
    if (this.props.prevAnswer !== prevProps.prevAnswer) {
      this.setState({ answer: this.props.prevAnswer });
    }
  }

  render() {
    return (<form onSubmit={this.submitAnswer}>
      <div className="input-group">
        {this.props.question.is_active ?
          <AnswerText
            answer={this.state.answer}
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

class QuestionComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      question: null,
      failedMessage: null,
      prevAnswer: '',
      expectedAnswer: null,
      tags: [],
      userTags: []
    };
  }

  fetching = false

  clearFetching = () => this.fetching = false

  handleError = error => {
    this.setState({ failedMessage: error.message });
    this.clearFetching();
  }

  fetchQuestionMeta = () => {
    let prevRespGetter = authenticationService
      .httpGet(`/api/questions/${this.props.day}/response`);

    let tagRespGetter = authenticationService
      .httpGet(`/api/questions/${this.props.day}/tags`);

    let correctRespGetter = this.state.question.is_active ?
      null :
      authenticationService.httpGet(`/api/questions/${this.props.day}/answer`);

    Promise.all(
      [prevRespGetter, tagRespGetter, correctRespGetter]
    ).then(results => {
      let correctResp = results[2];

      Promise.all([
        results[0].json(),                      // prev response
        results[1].json(),                      // tags
        correctResp ? correctResp.json() : null // correct response (if old question)
      ]).then(responses => {
        const prev = responses[0];
        const expected = responses[2];
        let tags = responses[1].map(t => t.tag);
        this.setState(
          {
            prevAnswer: prev ? prev.response : '',
            tags,
            userTags: (prev ? prev.tags : []),
            expectedAnswer: expected ? expected.answer : ''
          },
          this.clearFetching
        )
      }).catch(this.handleError);
    });
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
        this.fetchQuestionMeta
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
        tags: this.state.userTags
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

  tagify = newTag => newTag.replace(/\W+/gi, '').toLowerCase()

  addTag = newTag => {
    const formattedTag = this.tagify(newTag);
    const hasThisTag = tag => tag === formattedTag;
    if (!this.state.userTags.find(hasThisTag)) {
      this.setState({
        userTags: this.state.userTags.concat([formattedTag])
      });
    }
  }

  removeTag = doomedTag => {
    this.setState({
      userTags: this.state.userTags.filter(t => t !== doomedTag)
    });
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
          <Tagger
            tags={this.state.tags}
            userTags={this.state.userTags}
            addTag={this.addTag}
            removeTag={this.removeTag}
            editable={(this.state.question && this.state.question.is_active) ? true : false} />
          <ReactMarkdown className="card-text">{question.body}</ReactMarkdown>
        </div>
        <div className="card-footer">
          <AnswerBox
            submitAnswer={this.submitAnswer}
            question={question}
            prevAnswer={this.state.prevAnswer} />
          <ExpectedAnswer expectedAnswer={this.state.expectedAnswer} />
        </div>
      </div>
    </div>);
  }
}

const Question = () => {
  const { day } = useParams();
  return (<QuestionComponent day={day}/>);
}

export default Question;

import React from 'react';
import ReactMarkdown from 'react-markdown';
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {dark} from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Header } from './Styling';
import Tagger from './Tagger';
import { popSuccess, handleError } from './handleError';
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
    return (<p>Expected Answer: <b>{this.props.expectedAnswer}</b></p>);
  }
}

class AnswerText extends React.Component {
  render = () => (<input
    type="text"
    className="form-control"
    placeholder="Your Answer"
    value={this.props.answer}
    disabled={this.props.submitting}
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
            updateAnswer={this.updateAnswer}
            submitting={this.props.submitting} /> :
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
      prevAnswer: '',
      expectedAnswer: null,
      tags: [],
      userTags: [],
      submitting: false
    };
  }

  catchError = error => {
    this.setState({ submitting: false });
    handleError(error);
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
          }
        )
      }).catch(this.catchError);
    });
  }

  fetchQuestion = () => {
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
          prevAnswer: '',
        },
        this.fetchQuestionMeta
      )
    ).catch(this.catchError);

    return (<WaitHeader/>);
  }

  submitAnswer = answer => {
    if (!answer) { return; }

    const ans = answer.trim();
    if (!ans.length) { return; }

    this.setState({ submitting: true });

    authenticationService.httpPost(
      `/api/questions/${this.props.day}/response`,
      {
        response: ans,
        tags: this.state.userTags
      }
    ).then(
      resp => resp.json()
    ).then(
      () => {
        this.setState({
          question: null,
          prevAnswer: '',
          tags: [],
          submitting: false
        });
        popSuccess('Submitted!');
      }
    ).catch(this.catchError);
  }

  initFetchQuestion = () => {
    this.fetchQuestion();
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
    if (!this.state.question) {
      return this.initFetchQuestion();
    }

    const question = this.state.question;
    return (<div>
      <div>
        <h1>{question.title}</h1>
        <Tagger
          tags={this.state.tags}
          userTags={this.state.userTags}
          addTag={this.addTag}
          removeTag={this.removeTag}
          editable={(this.state.question && this.state.question.is_active) ? true : false} />
        <ReactMarkdown
          className="card-text"
          components={{
            code({node, inline, className, children, ...props}) {
              const match = /language-(\w+)/.exec(className || '')
              return !inline && match ? (
                <SyntaxHighlighter
                  children={String(children).replace(/\n$/, '')}
                  style={dark}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                />
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              )
            }
          }}>{question.body}</ReactMarkdown>
      </div>
      <div className="card-footer">
        <AnswerBox
          submitAnswer={this.submitAnswer}
          question={question}
          prevAnswer={this.state.prevAnswer}
          submitting={this.state.submitting} />
        <ExpectedAnswer
          expectedAnswer={this.state.expectedAnswer}
          submitting={this.state.submitting}/>
      </div>
    </div>);
  }
}

const Question = () => {
  const { day } = useParams();
  return (<QuestionComponent day={day}  />);
}

export default Question;

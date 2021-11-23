import React from 'react';
import ReactMarkdown from 'react-markdown';
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {dark} from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Header } from './Styling';
import Tagger from './Tagger';
import TagCloudWrapper from './TagCloudWrapper';
import { popSuccess, handleError } from './handleError';
import { useParams } from 'react-router-dom';
import { authenticationService } from './_services/authentication.service';
import { timeRemaining } from './dateHandling';
import rehypeRaw from 'rehype-raw'

class ExpectedAnswer extends React.Component {
  render() {
    if (!this.props.expectedAnswer) {
      return null;
    }
    return (<div className="row">
      <div className="col-md-6"/>
      <div className="col-md-6">
        <p>Expected Answer: <b>{this.props.expectedAnswer}</b></p>
      </div>
    </div>);
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
    value={`Your Answer: ${this.props.prevAnswer || '---'}`}
    disabled />)

  componentDidUpdate = (prevProps, prevState) => {
    if (this.props.prevAnswer !== prevProps.prevAnswer) {
      this.setState({ answer: this.props.prevAnswer });
    }
  }

  render() {
    return (<form className="row">
      <div className="col-md-6" />
      <div className="col-md-6">
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
              (<button
                type="submit"
                className="btn btn-primary"
                onClick={this.submitAnswer}>Submit</button>) :
              null
          }
        </div>
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

  componentDidMount() {
    const apiRoot = `/api/questions/${this.props.day}`;
    Promise.all([
      authenticationService.httpGet(apiRoot),
      authenticationService.httpGet(`${apiRoot}/response`),
      authenticationService.httpGet(`${apiRoot}/tags`),
      authenticationService.httpGet(`${apiRoot}/answer`)
    ]).then(results => {
      let correctResp = results[3];

      Promise.all([
        results[0].json(),                      // question response
        results[1].json(),                      // prev response
        results[2].json(),                      // tags
        correctResp ? correctResp.json() : null // correct response (if old question)
      ]).then(responses => {
        const prev = responses[1];
        const expected = responses[3];
        this.setState(
          {
            question: responses[0],
            prevAnswer: prev ? prev.response : '',
            tags: responses[2],
            userTags: (prev ? prev.tags : []),
            expectedAnswer: expected ? expected.answer : ''
          }
        )
      }).catch(this.catchError);
    });
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
        this.setState({ submitting: false });
        popSuccess('Submitted!');
      }
    ).catch(this.catchError);
  }

  tagify = newTag => newTag.replace(/\W+/gi, '').toLowerCase().trim()

  addTag = newTag => {
    const formattedTag = this.tagify(newTag);
    if (!formattedTag || !formattedTag.length) {
      return;
    }

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
      return (<Header>Please Wait...</Header>);
    }

    const question = this.state.question;
    return (<div>
      <div>
        <h1>{question.title}</h1>
        {this.state.question.is_active && <div className="alert alert-dark">{timeRemaining(question.deactivate_date)} remaining</div>}
        {!this.state.question.is_active && this.state.tags.length > 0 ?
          <TagCloudWrapper tags={this.state.tags} /> :
          null }
        <ReactMarkdown
          className="card-text"
          rehypePlugins={[rehypeRaw]}
          components={{
            img({alt, src, title}) {
              return <img alt={alt} src={src} title={title} className="img-fluid" />
            },
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
        <Tagger
          tags={this.state.tags}
          userTags={this.state.userTags}
          addTag={this.addTag}
          removeTag={this.removeTag}
          editable={this.state.question.is_active ? true : false}
          questionId={this.props.day} />
        <br/>
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

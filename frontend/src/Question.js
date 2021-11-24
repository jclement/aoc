import React from 'react';
import ReactMarkdown from 'react-markdown';
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {dark} from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Header, ButtonBar } from './Styling';
import Tagger from './Tagger';
import TagCloudWrapper from './TagCloudWrapper';
import { popSuccess, handleError } from './handleError';
import { useParams } from 'react-router-dom';
import { authenticationService } from './_services/authentication.service';
import { timeRemaining } from './dateHandling';
import rehypeRaw from 'rehype-raw'

class QuestionComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      question: null,
      answer: '',
      expectedAnswer: null,
      score: null,
      tags: [],
      userTags: [],
      submitting: false,
      user: null
    };
  }

  catchError = error => {
    this.setState({ submitting: false });
    handleError(error);
  }

  componentDidMount() {
    authenticationService.user.subscribe((x) => {
      if (x !== undefined) {
        this.setState({ user: x });
      }
    });

    const apiRoot = `/api/questions/${this.props.day}`;
    Promise.all([
      authenticationService.httpGet(apiRoot),
      authenticationService.httpGet(`${apiRoot}/response`),
      authenticationService.httpGet(`${apiRoot}/tags`),
      authenticationService.httpGet(`${apiRoot}/answer`),
      authenticationService.httpGet(`${apiRoot}/score`)
    ]).then(results => {
      let correctResp = results[3];

      Promise.all([
        results[0].json(),                       // question response
        results[1].json(),                       // prev response
        results[2].json(),                       // tags
        correctResp ? correctResp.json() : null, // correct response (if old question)
        results[4].json() // score
      ]).then(responses => {
        const prev = responses[1];
        const expected = responses[3];
        this.setState(
          {
            question: responses[0],
            answer: prev ? prev.response : '',
            tags: responses[2],
            userTags: (prev ? prev.tags : []),
            expectedAnswer: expected ? expected.answer : '',
            score: responses[4].score
          }
        )
      }).catch(this.catchError);
    });
  }

  submitAnswer = (evt) => {
    const ans = this.state.answer.trim();
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

  onAnswerChange = (evt) => {
    this.setState({"answer": evt.target.value});
  }

  render() {
    if (!this.state.question) {
      return (<Header>Please Wait...</Header>);
    }
    const question = this.state.question;
    var body = question.body;
    body = body.replace('{{id}}', this.state.user.id);
    body = body.replace('{{name}}', this.state.user.username);
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
          }}>{body}</ReactMarkdown>
      </div>

      {this.state.question.is_complete && <div className="card">
        <div className="card-header bg-warning">Results for Your Response</div>
        <div className="card-body">
          <table>
            <tr><th>Your response:</th><td>{this.state.answer}</td></tr>
            <tr><th>Correct response:&nbsp;</th><td>{this.state.expectedAnswer}</td></tr>
            <tr><th>Points Awarded:</th><td>{this.state.score}</td></tr>
            <tr><th>Your tags:</th><td>
              {this.state.userTags.map(t => {
                return <span className="badge rounded-pill bg-primary" style={{marginRight: "5px"}}>{t}</span>
              })}
            </td></tr>
          </table>
        </div>
        </div>}

      {this.state.question.is_active && <div className="card">
        <div className="card-header bg-primary text-white">Your Response</div>
        <div className="card-body">
            <div className="row mb-3">
              <label htmlFor="tags" className="col-sm-2 col-form-label">
                Tags:
              </label>
              <div id="tags" className="col-sm-10">
                <Tagger
                  tags={this.state.tags}
                  userTags={this.state.userTags}
                  addTag={this.addTag}
                  removeTag={this.removeTag}
                  editable={this.state.question.is_active ? true : false} />
              </div>
            </div>
            <div className="row mb-3">
              <label htmlFor="answer" className="col-sm-2 col-form-label">
                Answer:
              </label>
              <div id="answer" className="col-sm-10">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Your Answer"
                  value={this.state.answer}
                  disabled={this.state.submitting}
                  onChange={this.onAnswerChange} />
                </div>
              </div>
        </div>
        <div className="card-footer">
          <ButtonBar>
            <button
              className="btn btn-primary"
              disabled={!this.state.answer || this.state.submitting}
              onClick={this.submitAnswer}>Submit Answer and Tags</button>
          </ButtonBar>
        </div>
        </div>
      }
      </div>
    );
  }
}

const Question = () => {
  const { day } = useParams();
  return (<QuestionComponent day={day}  />);
}

export default Question;

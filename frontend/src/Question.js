import React from 'react';
import AceEditor from "react-ace";
import ReactMarkdown from 'react-markdown';
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {dark} from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Header, ButtonBar } from './Styling';
import Tagger from './Tagger';
import TagCloudWrapper from './TagCloudWrapper';
import { popSuccess, popError, handleError } from './handleError';
import { useParams } from 'react-router-dom';
import { authenticationService } from './_services/authentication.service';
import { parseToLocal } from './dateHandling';
import rehypeRaw from 'rehype-raw'
import Countdown from 'react-countdown';
import keyHandler from './keyHandler';
import { darken, konamiSequence } from './konamiHandler';
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-csharp";
import "ace-builds/src-noconflict/mode-golang";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-typescript";
import "ace-builds/src-noconflict/mode-rust";
import "ace-builds/src-noconflict/mode-perl";
import "ace-builds/src-noconflict/mode-lua";
import "ace-builds/src-noconflict/ext-language_tools"


const konamiId = '93d11bb4dba141a587413137112ae59e';
const solutionLanguages = {
  'text':'text',
  'csharp':'csharp',
  'python':'python',
  'golang':'go',
  'java':'java',
  'javascript':'javascript',
  'typescript':'typescript',
  'ruby':'ruby',
  'rust':'rust',
  'lua':'lua',
  'perl':'perl'
};

class MyTag extends React.Component {
  render = () => (<span className="badge rounded-pill bg-primary userTag">
    {this.props.children}
  </span>)
}

class QuestionBody extends React.Component {
  constructor(props) {
    super(props);
    this.state = { renderedOnce: false };
  }

  replaceAll = (str, find, replace) => str.replace(new RegExp(find, 'g'), replace);

  processBody = () => {
    var body = this.replaceAll(
      this.props.question.body,
      '{{id}}',
      this.props.user.id
    );
    return this.replaceAll(body, '{{name}}', this.props.user.username);
  };

  preRenderedResult = null

  preRender = () => {
    this.preRenderedResult = (<ReactMarkdown
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
      }}>{this.processBody()}</ReactMarkdown>);
    return this.preRenderedResult;
  }

  render = () => (<div>
    <h1>{this.props.question.title}</h1>
    {
      this.props.question.is_active ?
        (<div className="alert alert-dark">
          <Countdown
            date={parseToLocal(this.props.question.deactivate_date)}
            renderer={this.props.renderer}
            onComplete={this.props.shutErDown} />
        </div>) :
        (<TagCloudWrapper tags={this.props.tags} />)
    }
    {this.preRenderedResult ? this.preRenderedResult : this.preRender()}
  </div>)
}

class QuestionComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      question: null,
      answer: '',
      solution: '',
      solution_lang: '',
      expectedAnswer: null,
      score: null,
      tags: [],
      userTags: [],
      solutions:[],
      submitting: false,
      user: null
    };

    if (props.day === konamiId) {
      const handler = keyHandler([
        {
          sequence: konamiSequence,
          handler: () => {
            darken();
            window.setTimeout(
              () => this.setState({ answer: '🤐' }),
              100
            )
          }
        }
      ]);

      this.handleKeyDown = evt => {
        evt.stopPropagation();
        handler.handle(evt.key);
      }
    } else {
      this.handleKeyDown = () => {};
    }
  }

  catchError = error => {
    this.setState({ submitting: false });
    handleError(error);
  }

  fetchQuestion = () => {
    const apiRoot = `/api/questions/${this.props.day}`;
    Promise.all([
      authenticationService.httpGet(apiRoot),
      authenticationService.httpGet(`${apiRoot}/response`),
      authenticationService.httpGet(`${apiRoot}/tags`),
      authenticationService.httpGet(`${apiRoot}/answer`),
      authenticationService.httpGet(`${apiRoot}/score`),
      authenticationService.httpGet(`${apiRoot}/solutions`)
    ]).then(results => {
      let correctResp = results[3];

      Promise.all([
        results[0].json(),                       // question response
        results[1].json(),                       // prev response
        results[2].json(),                       // tags
        correctResp ? correctResp.json() : null, // correct response (if old question)
        results[4].json(), // score
        results[5].json() // score
      ]).then(responses => {
        const prev = responses[1];
        const expected = responses[3];
        this.setState(
          {
            question: responses[0],
            answer: prev ? prev.response : '',
            solution: prev ? prev.solution : '',
            solution_lang: prev ? prev.solution_lang : '',
            tags: responses[2],
            userTags: (prev ? prev.tags : []),
            expectedAnswer: expected ? expected.answer : '',
            score: responses[4].score,
            solutions: responses[5],
            submitting: false
          }
        )
      }).catch(this.catchError);
    });
  }

  componentDidMount() {
    authenticationService.user.subscribe((x) => {
      if (x !== undefined) {
        this.setState({ user: x });
      }
    });

    this.fetchQuestion();
  }

  submitAnswer = (evt) => {
    const ans = this.state.answer.trim();
    //if (!ans.length) { return; }

    this.setState({ submitting: true });

    authenticationService.httpPost(
      `/api/questions/${this.props.day}/response`,
      {
        response: ans,
        solution: this.state.solution,
        solution_lang: this.state.solution_lang,
        tags: this.state.userTags
      }
    ).then(
      resp => resp.json()
    ).then(
      (r) => {
        this.setState({ submitting: false });
        if (r.result) {
          popSuccess('Submitted!');
        } else {
          popError('Failed! ' + r.message);

        }
      }
    ).catch(this.catchError);
  }

  addTag = newTag => {
    const formattedTag = newTag.trim();
    if (!formattedTag || !formattedTag.length) {
      return;
    }

    if (!this.state.userTags.find(t => t === formattedTag)) {
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
    this.setState({answer: evt.target.value});
  }

  onSolutionChange = (v) => {
    this.setState({solution: v});
  }

  onSolutionLangChange = (v) => {
    this.setState({solution_lang: v.target.value});
  }

  shutErDown = () => {
    this.setState(
      { submitting: true },
      this.fetchQuestion
    );
  }

  plural = n => (n > 1 ? 's' : '')
  wordify = (unit, n) => (n ? `${n} ${unit}${this.plural(n)}` : '')
  renderer = ({ days, hours, minutes, seconds, completed }) => {
    if (completed) {
      return (<span>Complete</span>);
    }
    return [
      this.wordify('day', days),
      this.wordify('hour', hours),
      this.wordify('minute', minutes),
      this.wordify('second', seconds)
    ].filter(s => !!s.length).join(' ') + ' remaining';
  }

  render() {
    if (!this.state.question) {
      return (<Header>Please Wait...</Header>);
    }
    const question = this.state.question;
    return (<div>
      <QuestionBody
        question={question}
        renderer={this.renderer}
        shutErDown={this.shutErDown}
        tags={this.state.tags}
        user={this.state.user} />

      {question.is_complete && <div className="card">
        <div className="card-header bg-warning">Results for your response</div>
        <div className="card-body">
          <table><tbody>
            <tr><th>Your response:</th><td>{this.state.answer}</td></tr>
            <tr><th>Correct response:&nbsp;</th><td>{this.state.expectedAnswer}</td></tr>
            <tr><th>Points Awarded:</th><td>{this.state.score}</td></tr>
            <tr>
              <th>Your tags:</th>
              <td>{this.state.userTags.map(t => <MyTag key={t}>{t}</MyTag>)}</td>
            </tr>
          </tbody></table>
        </div>
        </div>}

      {question.is_complete && <div>
        <br></br>
        <br></br>
        <h2>Solutions...</h2>
       {this.state.solutions.filter((s) => s.solution).map((s) => 
        <div className="card card-solution" key={s.user_id}>
        <div className="card-header bg-default"><img
          src={`https://robots.adventofqode.org/${s.user_id}.png?size=30x30`}
          alt={s.username} />{s.username} &nbsp;
          <div className="badge rounded-pill bg-dark">{s.points} pts</div>
        </div>
        <SyntaxHighlighter language={solutionLanguages[s.solution_lang.toLowerCase()]} showLineNumbers={true}>
          {s.solution}
        </SyntaxHighlighter>
        </div>
        )}
        </div>}

      {question.is_active && <div className="card">
        <div className="card-header bg-primary text-white">Your Response</div>
        <div className="card-body">
          <div className="row mb-3" onKeyDown={this.handleKeyDown}>
            <label htmlFor="answer" className="col-sm-2 col-form-label">
              Answer:
            </label>
            <div id="answer" className="col-sm-10">
              <input
                type="text"
                className="form-control"
                placeholder={this.props.day === konamiId ? 'Unlock the console' : 'Your Answer'}
                value={this.state.answer}
                disabled={this.state.submitting}
                onChange={this.onAnswerChange} />
            </div>
          </div>
          <hr/>
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
                editable={question.is_active ? true : false} />
            </div>
          </div>

          { this.state.user.is_admin && <div>
            <hr/>
            <div className="row mb-3 hint">
              Optionally, if you are proud of your code, feel free to post it below.
            </div>
            <div className="row mb-3">
              <label htmlFor="solution" className="col-sm-2 col-form-label">
                Your Code:
              </label>
              <div id="solution" className="col-sm-10">
                <AceEditor
                  mode={this.state.solution_lang}
                  theme="github"
                  value={this.state.solution}
                  onChange={this.onSolutionChange}
                  name="codeEditor"
                  editorProps={{ $blockScrolling: true }}
                /><br/>
                <select className="form-select" value={this.state.solution_lang} onChange={this.onSolutionLangChange}>
                  {Object.keys(solutionLanguages).map((lang) => 
                  <option key={lang} value={lang}>{lang}</option>
                  )}
                </select>
              </div>
            </div>
          </div>}

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

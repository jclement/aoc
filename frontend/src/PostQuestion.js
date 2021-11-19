import React from 'react';
import Header from './Header';
import { toast } from 'react-toastify';
import { authenticationService } from './_services/authentication.service';

const popError = msg => toast(msg, { theme: 'colored', type: 'error' });

const handleError = err => {
  if (err.detail) {
    err.detail.forEach(e => popError(e.msg));
  } else {
    popError(err.message ? err.messge : err || err.toString());
  }
}

// ---- Date Formatting ----

const isSqlite = true;
const toUtc = dateStr => (
  isSqlite ?
    `${dateStr} 00:00:00` :       // date format: 2020-01-01 00:00:00
    `${dateStr}T00:00:00Z-7:00`   // This is so dumb. Assuming MST midnight.
)
// --------


class QuestionInput extends React.Component {
  render() {
    return (<div className="col-lg-6">
      <b><label htmlFor={this.props.id}>{this.props.label}</label></b>
      <input
        type={this.props.isDate ? 'date' : 'text'}
        className="form-control"
        value={this.props.value}
        onChange={this.props.updater} />
    </div>);
  }
}

class QuestionPosterComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      id: '',
      title: '',
      active: '',
      deactive: '',
      body: '',
      answer: ''
    };
  }

  getSubmitErrors = () => {
    return [
      (this.state.title ? null : 'Missing Title'),
      (this.state.body ? null : 'Missing Body'),
      (this.state.active ? null : 'Missing Activate Date'),
      (this.state.deactive ? null : 'Missing Deactivate Date'),
      (this.state.active && this.state.deactive && this.state.active >= this.state.deactive ?
        'The Activate Date needs to be before the Deactivate Date' :
      null),
      (this.state.answer ? null : 'Missing Answer')
    ].filter(e => e !== null);
  }

  submitAnswer = () => {
    authenticationService.httpPut(
      `/api/questions/${this.state.id}/answer`,
      { answer: this.state.answer.trim() }
    ).then(
      resp => resp.json()
    ).then(validation => {
      if (!validation.result) {
        popError(validation.message);
      } else {
        toast('Success!', { theme: 'colored', type: 'success' });
      }
    }).catch(handleError);
  }

  postQuestion = evt => {
    evt.preventDefault();

    let anyErrors = this.getSubmitErrors().map(err => {
      toast(err, { theme: 'colored', type: 'error' });
      return 1;
    });

    if (anyErrors.length) { return; }

    authenticationService.httpPost(
      '/api/questions',
      {
        title: this.state.title,
        body: this.state.body,
        activate_date: toUtc(this.state.active),
        deactivate_date: toUtc(this.state.deactive)
      }
    ).then(
      resp => resp.json()
    ).then(question => {
      this.setState(
        { id: question.id },
        this.submitAnswer
      );
    }).catch(handleError);
  }

  render() {
    if (!this.updaters) {
      this.updaters = {
        title: evt => this.setState({ title: evt.target.value }),
        active: evt => this.setState({ active: evt.target.value }),
        deactive: evt => this.setState({ deactive: evt.target.value }),
        body: evt => this.setState({ body: evt.target.value }),
        answer: evt => this.setState({ answer: evt.target.value }),
      };
    }

    return (<form>
      <p><b>Id: </b>{this.state.id ? this.state.id : '???'}</p>
      <div className="mb-3 row">
        <QuestionInput
          id="ques_title" label="Title"
          value={this.state.title}
          updater={this.updaters.title}/>
      </div>
      <div className="mb-3 row">
        <QuestionInput
          id="ques_active" label="Activate Date" isDate={1}
          value={this.state.active}
          updater={this.updaters.active} />
        <QuestionInput
          id="ques_deactive" label="Deactivate Date" isDate={1}
          value={this.state.deactive}
          updater={this.updaters.deactive} />
      </div>
      <div className="mb-3">
        <b><label htmlFor="ques_body">Question Body</label></b>
        <textarea
          id="ques_body"
          type="text"
          className="form-control"
          value={this.state.body}
          onChange={this.updaters.body}
          placeholder="For the sake of your sanity, copy-paste"></textarea>
      </div>
      <div className="mb-3 row">
        <QuestionInput
          id="answer" label="Answer"
          value={this.state.answer}
          updater={this.updaters.answer} />
      </div>
      <button
        type="submit"
        className="btn btn-primary"
        onClick={this.postQuestion}>Submit</button>
    </form>);
  }
}

const QuestionPoster = () => (<div>
  <Header>Post a new Question</Header>
  <QuestionPosterComponent />
</div>);

export default QuestionPoster;

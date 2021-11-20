import React from 'react';
import { Header, ButtonBar } from './Styling';
import { handleError, popError, popSuccess } from './handleError';
import { useParams, useNavigate } from 'react-router-dom';
import { authenticationService } from './_services/authentication.service';

// ---- Date Formatting ----

const isSqlite = true;
const toUtc = dateStr => (
  isSqlite ?
    `${dateStr} 00:00:00` :       // date format: 2020-01-01 00:00:00
    `${dateStr}T00:00:00Z-7:00`   // This is so dumb. Assuming MST midnight.
)
const fromUtc = dateStr => dateStr.substring(0, 10)

// --------


class QuestionInput extends React.Component {
  render() {
    return (<div className="col-lg-6">
      <b><label htmlFor={this.props.id}>{this.props.label}</label></b>
      <input
        type={this.props.isDate ? 'date' : 'text'}
        disabled={this.props.disabled}
        className="form-control"
        value={this.props.value}
        onChange={this.props.updater} />
    </div>);
  }
}

class QuestionEditorComponent extends React.Component {
  constructor(props) {
    super(props);

    this.blankSlate = {
      title: '',
      activeDate: '',
      deactiveDate: '',
      body: '',
      answer: '',
      isPast: false,
      submitting: false
    };
    this.state = this.blankSlate;
  }

  getSubmitErrors = () => {
    return [
      (this.state.title ? null : 'Missing Title'),
      (this.state.body ? null : 'Missing Body'),
      (this.state.activeDate ? null : 'Missing Activate Date'),
      (this.state.deactiveDate ? null : 'Missing Deactivate Date'),
      (this.state.activeDate && this.state.deactiveDate && this.state.activeDate >= this.state.deactiveDate ?
        'The Activate Date needs to be before the Deactivate Date' :
      null),
      (this.state.answer ? null : 'Missing Answer')
    ].filter(e => e !== null);
  }

  allowSubmit = () => this.setState({ submitting: false })

  handleSubmitError = err => {
    handleError(err);
    this.allowSubmit();
  }

  updateAnswer = () => {
    authenticationService.httpPut(
      `/api/questions/${this.props.qid}/answer`,
      { answer: this.state.answer.trim() }
    ).then(
      resp => resp.json()
    ).then(validation => {
      if (!validation.result) {
        popError(validation.message);
      } else {
        popSuccess('Success!');
        this.allowSubmit();
      }
    }).catch(handleError);
  }

  updateQuestion = evt => {
    evt.preventDefault();

    let anyErrors = this.getSubmitErrors().map(err => {
      popError(err);
      return 1;
    });
    if (anyErrors.length) { return; }

    this.setState({ submitting: true });

    authenticationService.httpPut(
      `/api/questions/${this.props.qid}`,
      {
        title: this.state.title,
        body: this.state.body,
        activate_date: toUtc(this.state.activeDate),
        deactivate_date: toUtc(this.state.deactiveDate)
      }
    ).then(
      resp => resp.json()
    ).then(question => {
      this.updateAnswer();
    }).catch(handleError);
  }

  retrieveQuestion = qid => {
    Promise.all([
      authenticationService.httpGet(`/api/questions/${qid}`),
      authenticationService.httpGet(`/api/questions/${qid}/answer`)
    ]).then(results => {
      Promise.all([
        results[0].json(),
        results[1].json()
      ]).then(responses => {
        const question = responses[0];
        this.setState({
          title: question.title,
          activeDate: fromUtc(question.activate_date),
          deactiveDate: fromUtc(question.deactivate_date),
          body: question.body,
          answer: responses[1].answer,
          isPast: (new Date()).toISOString().substring(0, 10) > fromUtc(question.deactivate_date)
        });
      }).catch(handleError);
    }).catch(handleError);
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (this.props.qid !== prevProps.qid) {
      this.retrieveQuestion(this.props.qid);
    }
  }

  componentDidMount = () => this.retrieveQuestion(this.props.qid)

  confirmDelete = evt => {
    evt.preventDefault();
    const confirmation = window.confirm(`Really delete question "${this.state.title}"?`);

    if (confirmation) {
      authenticationService.httpDelete(
        `/api/questions/${this.props.qid}`
      ).then(
        resp => resp.json()
      ).then(validation => {
        if (!validation.result) {
          handleError(validation);
        } else {
          popSuccess('Deleted!');
          this.props.fnNav('/editquestion');
        }
      })
    }
  }

  render() {
    if (!this.updaters) {
      this.updaters = {
        title: evt => this.setState({ title: evt.target.value }),
        activeDate: evt => this.setState({ activeDate: evt.target.value }),
        deactiveDate: evt => this.setState({ deactiveDate: evt.target.value }),
        body: evt => this.setState({ body: evt.target.value }),
        answer: evt => this.setState({ answer: evt.target.value }),
      };
    }

    const disabled = this.state.isPast || this.state.submitting;

    return (<form>
      <p><b>Id: </b>{this.props.qid ? this.props.qid : '???'}</p>
      <div className="mb-3 row">
        <QuestionInput
          id="ques_title" label="Title"
          disabled={disabled}
          value={this.state.title}
          updater={this.updaters.title}/>
      </div>
      <div className="mb-3 row">
        <QuestionInput
          id="ques_active" label="Activate Date" isDate={1}
          disabled={disabled}
          value={this.state.activeDate}
          updater={this.updaters.activeDate} />
        <QuestionInput
          id="ques_deactive" label="Deactivate Date" isDate={1}
          disabled={disabled}
          value={this.state.deactiveDate}
          updater={this.updaters.deactiveDate} />
      </div>
      <div className="mb-3">
        <b><label htmlFor="ques_body">Question Body</label></b>
        <textarea
          id="ques_body"
          className="form-control"
          disabled={disabled}
          value={this.state.body}
          onChange={this.updaters.body}
          placeholder="For the sake of your sanity, copy-paste"></textarea>
      </div>
      <div className="mb-3 row">
        <QuestionInput
          id="answer" label="Answer"
          disabled={disabled}
          value={this.state.answer}
          updater={this.updaters.answer} />
      </div>
      <ButtonBar>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={this.state.isPast || this.state.submitting}
          onClick={this.updateQuestion}>Update</button>
        <button
          type="button"
          className="btn btn-danger"
          disabled={this.state.isPast || this.state.submitting}
          onClick={this.confirmDelete}>Delete</button>
      </ButtonBar>
    </form>);
  }
}

const QuestionEditor = () => {
  const { qid } = useParams();
  return (<div>
    <Header>Edit a Question</Header>
    <QuestionEditorComponent qid={qid} fnNav={useNavigate()} />
  </div>);
};

export default QuestionEditor;

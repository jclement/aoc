import React from 'react';
import Header from './Header';

class QuestionPosterComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      active: '',
      deactive: '',
      body: ''
    };
  }

  postQuestion = evt => {
    evt.preventDefault();
    fetch(
      '/api/questions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + localStorage.getItem('token'),
          body: JSON.stringify({
            title: this.state.title,
            activate_date: this.state.active,
            deactivate_date: this.state.deactive,
            body: this.state.body
          })
        }
      }
    )
  }

  render() {
    if (!this.updaters) {
      this.updaters = {
        title: evt => this.setState({ title: evt.target.value }),
        active: evt => this.setState({ active: evt.target.value }),
        deactive: evt => this.setState({ deactive: evt.target.value }),
        body: evt => this.setState({ body: evt.target.value })
      };
    }
    return (<form>
      <div className="mb-3">
        <label htmlFor="ques_title">Title</label>
        <input
          id="ques_title"
          type="text"
          className="form-control"
          value={this.state.title}
          onChange={this.updaters.title} />
      </div>
      <div className="mb-3">
        <label htmlFor="ques_active">Activate Date</label>
        <input
          id="ques_active"
          type="text"
          className="form-control"
          value={this.state.active}
          onChange={this.updaters.active} />
      </div>
      <div className="mb-3">
        <label htmlFor="ques_deactive">Deactivate Date</label>
        <input
          id="ques_deactive"
          type="text"
          className="form-control"
          value={this.state.deactive}
          onChange={this.updaters.deactive} />
      </div>
      <div className="mb-3">
        <label htmlFor="ques_body">Body</label>
        <input
          id="ques_body"
          type="text"
          className="form-control"
          value={this.state.body}
          onChange={this.updaters.body} />
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

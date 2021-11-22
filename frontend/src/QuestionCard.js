import React from 'react';
import { Link } from 'react-router-dom';

class QuestionCard extends React.Component {
  isAvailable = () => (this.props.question.is_active && this.props.question.is_visible)

  getClass = () => (this.props.question.is_visible ?
    'nav-link' :
    'nav-link bg-secondary text-light')

  render = () => (<Link
    to={`/${this.props.pathPrefix}/${this.props.question.id}`}
    className={this.getClass()}>
    {this.props.question.title}
  </Link>)
}

export default QuestionCard;

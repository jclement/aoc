import React from 'react';
import './Question.css';
import Header from './Header';

class EmptyQuestionComponent extends React.Component {
  render = () => (<div className="full-height">
    <Header>👈 Pick a Question</Header>
  </div>)
}

const EmptyQuestion = () => (<EmptyQuestionComponent />);

export default EmptyQuestion;

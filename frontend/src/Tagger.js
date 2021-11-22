import React from 'react';

class BaseTag extends React.Component {
  render = () => (<span className="badge rounded-pill bg-secondary text-light">{this.props.children}</span>);
}

// to be replaced by a tag cloud
// class QuestionTagCollection extends React.Component {
//   renderTag = (tagTxt, tagNum) => (<BaseTag
//     key={tagNum}
//     tagNum={tagNum}>{tagTxt}</BaseTag>)
//
//   render() {
//     if (!this.props.tags || !this.props.tags.length) { return (<br/>); }
//     return (<div id="question-tags">{this.props.tags.map(this.renderTag)}</div>);
//   };
// }

class SkittleTag extends React.Component {
  constructor(props) {
    super(props);

    // Christmassy tags
    let tagClasses = [
      // 'primary',
      'success',
      'danger',
      // 'warning text-dark',
      // 'info text-dark',
      // 'dark'
    ].map(c => 'btn btn-' + c);

    const clsCount = tagClasses.length;
    this.getTag = () => tagClasses[this.props.tagNum % clsCount];
  }

  removeTag = () => this.props.removeTag(this.props.tagTxt)

  render = () => (<div className="btn-group btn-group-sm">
    <div className={this.getTag()}>
      {this.props.tagTxt}
    </div>
    <button
      type="button"
      onClick={this.removeTag}
      className={this.getTag()}>&times;</button>
  </div>)
}

class UserTagCollection extends React.Component {
  renderTag = (tagTxt, tagNum) => (<SkittleTag
    key={tagNum}
    removeTag={this.props.removeTag}
    tagNum={tagNum}
    tagTxt={tagTxt} />)

  render() {
    if (!this.props.tags || !this.props.tags.length) { return null; }

    return (<div className="card">
      <div className="card-body bg-light">
        <div className="float-end" id="user-tags">
          {this.props.tags.map(this.renderTag)}
        </div>
      </div>
    </div>);
  };
}

class TagAdder extends React.Component {
  constructor(props) {
    super(props);
    this.state = { newTag: '' };
  }

  addTag = evt => {
    evt.preventDefault();
    let newTag = this.state.newTag.trim();

    if (newTag.length) {
      this.setState(
        { newTag: '' },
        () => this.props.addTag(newTag)
      )
    }
  }

  updateNewTag = evt => this.setState({ newTag: evt.target.value })

  render() {
    if (!this.props.editable) { return null; }

    return (<div className="row">
      <div className="col-md-8" />
      <div className="col-md-4">
        <form className="input-group">
          <input
            type="text"
            className="form-control"
            value={this.state.newTag}
            onChange={this.updateNewTag}
            placeholder="+ New Tag"/>
          <button
            type="submit"
            className="btn btn-primary"
            onClick={this.addTag}>+</button>
        </form>
      </div>
    </div>);
  }
}

// <QuestionTagCollection tags={this.props.tags}/>
class Tagger extends React.Component {
  render = () => (<div>
    <UserTagCollection
      tags={this.props.userTags}
      removeTag={this.props.removeTag}/>
    <TagAdder addTag={this.props.addTag} editable={this.props.editable}/>
  </div>)
}

export default Tagger;

import React from 'react';

class AssortedTag extends React.Component {
  tagClasses = [
    'badge rounded-pill bg-primary',
    'badge rounded-pill bg-secondary',
    'badge rounded-pill bg-success',
    'badge rounded-pill bg-danger',
    'badge rounded-pill bg-warning text-dark',
    'badge rounded-pill bg-info text-dark',
    'badge rounded-pill bg-light text-dark',
    'badge rounded-pill bg-dark'
  ]
  // 8 tag variations

  render = () => (<span className={this.tagClasses[this.props.tagNum % 8]}>
    {this.props.children}
  </span>)
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

class TagCollection extends React.Component {
  renderTag = (tagTxt, tagNum) => (<AssortedTag
    key={tagNum}
    tagNum={tagNum}>{tagTxt}</AssortedTag>)

  render() {
    if (!this.props.tags || !this.props.tags.length) { return (<br/>); }

    return (<div className="card">
      <div className="card-body bg-light">
        {this.props.tags.map(this.renderTag)}
      </div>
    </div>);
  };
}

class Tagger extends React.Component {
  render = () => (<div>
    <TagCollection tags={this.props.tags}/>
    <TagAdder addTag={this.props.addTag} editable={this.props.editable}/>
  </div>)
}

export default Tagger;

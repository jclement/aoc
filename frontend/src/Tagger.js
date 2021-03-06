import React from 'react';

function debounce250(handler) {
  let timer = null;
  let fnRun = () => {
    handler();
    timer = null;
  };

  return () => {
    if (timer !== null) {
      window.clearTimeout(timer);
    }
    timer = window.setTimeout(fnRun, 250);
  };
}

class CompletionItem extends React.Component {
  completionClass = () => 'list-group-item clickable' + (this.props.isSelected ? ' selected' : '')

  addTag = evt => {
    evt.preventDefault();
    this.props.addTag(this.props.completion);
  }

  render = () => (<li
    className={this.completionClass()}
    onClick={this.addTag}>{this.props.completion}</li>)
}

class AutoComplete extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      txt: '',
      tags: [],
      completions: [],
      focused: false,
      selectedIndex: 0
    };

    this.delayedShowCompletions = debounce250(this.showCompletions);
  }

  componentDidMount() {
    const toSearchableTag = t => ({
      tag: t.tag,
      searched: t.tag.toLowerCase()
    });
    this.setState({
      tags: this.props.tags.sort().map(toSearchableTag)
    });
  }

  showCompletions = () => {
    const filterTerm = this.state.txt.toLowerCase().trim();
    if (!filterTerm.length) {
      this.setState({ completions: [] });
    } else {
      const completions = (this.state.tags
        .filter(t => t.searched.indexOf(filterTerm) > -1)
        .map(t => t.tag));
      this.setState({ completions });
    }
  }

  updateTxt = evt => {
    this.setState(
      {
        txt: evt.target.value,
        selectedIndex: 0
      },
      this.delayedShowCompletions
    );
  }

  gotFocus = () => this.setState({ focused: true })
  lostFocus = () => {
    window.setTimeout(() => this.setState({ focused: false }), 250);
  }

  bumpSelection = (evt, incr) => {
    evt.preventDefault();

    const completionCount = this.state.completions.length;
    this.setState({
      selectedIndex: (completionCount ?
        (this.state.selectedIndex + incr + completionCount) % completionCount :
        0
      )
    });
  }

  addTag = newTag => {
    this.setState(
      { txt: '', completions: [] },
      () => this.props.addTag(newTag)
    );
  }

  renderCompletion = (completion, i) => (<CompletionItem
    key={completion}
    completion={completion}
    isSelected={i === this.state.selectedIndex}
    addTag={this.addTag} />)

  addStateTag = evt => {
    if (evt && evt.preventDefault) {
      evt.preventDefault();
    }
    this.addTag(this.state.txt);
  }

  handleKeyDown = evt => {
    if (evt.key === 'Enter') {
      evt.preventDefault();

      if (this.state.completions.length) {
        this.addTag(this.state.completions[this.state.selectedIndex]);
      } else {
        this.addStateTag();
      }
    } else if (evt.key === 'ArrowUp') {
      this.bumpSelection(evt, -1);
    } else if (evt.key === 'ArrowDown') {
      this.bumpSelection(evt, 1);
    }
  }

  render = () => (<div className="float-end">
    <form className="btn-group">
      <input
        type="text"
        className="form-control"
        placeholder="+ New Tag"
        value={this.state.txt}
        onChange={this.updateTxt}
        onFocus={this.gotFocus}
        onBlur={this.lostFocus}
        onKeyDown={this.handleKeyDown}
        disabled={!this.props.editable} />
      <button
        type="button"
        className="btn btn-primary"
        onClick={this.addStateTag}>+</button>
    </form>
    {
      this.state.completions.length && this.state.focused ?
        (<ul className="autocompletions list-group border border-success">
          {this.state.completions.map(this.renderCompletion)}
        </ul>) :
        null
    }
  </div>)
}

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

  render = () => (<div className="float-end col-md-9 col-sm-12 border-0">
    {
      (this.props.tags && this.props.tags.length) ?
        (<div className="float-end" id="user-tags">
          {this.props.tags.map(this.renderTag)}
        </div>) :
      null
    }
  </div>);
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

    return (<div className="col-md-3 col-sm-12">
      <AutoComplete
        tags={this.props.tags}
        addTag={this.props.addTag}
        editable={this.props.editable} />
    </div>);
  }
}

class Tagger extends React.Component {
  render = () => (<div className="row">
    <UserTagCollection
      tags={this.props.userTags}
      removeTag={this.props.removeTag} />
    <TagAdder
      tags={this.props.tags}
      addTag={this.props.addTag}
      editable={this.props.editable} />
  </div>)
}

export default Tagger;

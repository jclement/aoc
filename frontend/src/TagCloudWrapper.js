import React from 'react';
import { TagCloud } from 'react-tagcloud'

class TagCloudWrapper extends React.Component {
  toTag = t => ({
    value: t.tag,
    count: t.count
  })

  colorOptions = {
    luminosity: 'dark',
    hue: 'green'
  }

  render() {
    if (!this.props.tags || !this.props.tags.length) { return null; }

    return (<div className="card">
      <div className="card-body border-secondary bg-light rounded">
      <TagCloud
        minSize={12}
        maxSize={35}
        colorOptions={this.colorOptions}
        tags={this.props.tags.map(this.toTag)} />
      </div>
    </div>);
  }
}

export default TagCloudWrapper;

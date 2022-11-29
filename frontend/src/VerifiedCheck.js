import React from "react";

export default class Verified extends React.Component {
  preRender = (<span>
    <img
      src="verified16.png"
      alt="verified"
      title="Has at least $8/month to spare" />
  </span>)

  render = () => this.props.user.is_admin ? this.preRender : null
}

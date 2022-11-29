import React from "react";

export default class VerifiedCheck extends React.Component {
  preRender = (<span>
    <img
      src="verified16.png"
      alt="verified"
      title="Has at least $8/month to spare" />
  </span>);

  isVerified = () => (this.props.user.is_admin || this.props.user.email === 'eli@lilly.fake');

  render = () => this.isVerified() ? this.preRender : null;
}

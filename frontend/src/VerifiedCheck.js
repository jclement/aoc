import React from "react";

export default class VerifiedCheck extends React.Component {
  preRender = (<span>
    <img
      src="verified16.png"
      alt="verified"
      title="Has at least $8/month to spare" />
  </span>);

  isVerified = () => (this.props.user.is_admin || ['eli@lilly.fake', 'rhyn0bytes@protonmail.com'].includes(this.props.user.email));

  render = () => this.isVerified() ? this.preRender : null;
}

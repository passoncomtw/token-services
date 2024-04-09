import React from 'react';

class Container extends React.PureComponent {
  render() {
    return <div>{this.props.children}</div>;
  }
}

export default Container;

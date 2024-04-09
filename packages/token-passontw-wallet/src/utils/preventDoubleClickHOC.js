import React, { PureComponent } from 'react';
import isFunction from 'lodash/isFunction';
import Debounce from 'lodash/debounce';

const preventDoubleClickHOC = (WrappedComponent, parentProps = {}) =>
  class extends PureComponent {
    constructor(props) {
      super(props);
      this.debouncedOnPressHandler = Debounce(
        () => {
          isFunction(this.onPress) && this.onPress();
        },
        500,
        {
          leading: true,
          trailing: false,
        }
      );
    }

    render() {
      const parentPropsOnPress = parentProps.onPress;
      const propsOnPress = this.props.onPress;
      this.onPress = isFunction(parentPropsOnPress)
        ? parentPropsOnPress
        : propsOnPress;
      return (
        <WrappedComponent
          {...this.props}
          onPress={this.debouncedOnPressHandler}
        />
      );
    }
  };

export default preventDoubleClickHOC;

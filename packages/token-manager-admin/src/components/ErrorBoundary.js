import React from 'react';
import GlobalErrorPageScene from '../screens/GlobalErrorPageScreen';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error, info) {
    this.setState({ hasError: true });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <GlobalErrorPageScene errorCode='500' errorMessage='Server Error' />
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

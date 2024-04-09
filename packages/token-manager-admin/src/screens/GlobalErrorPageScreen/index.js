import { connect } from 'react-redux';
import ErrorPage404 from './view';

const mapStateToProps = ({ auth }) => ({
  auth,
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(ErrorPage404);

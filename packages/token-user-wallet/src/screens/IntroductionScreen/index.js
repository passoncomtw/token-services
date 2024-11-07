import { connect } from 'react-redux';
import IntroductionScreen from './view';
import { hideIntroScreen } from '~/actions/IntroductionActions';

const mapStateToProps = () => ({});

const mapDispatchToProps = (dispatch) => ({
  handleHideIntroScreen: () => {
    dispatch(hideIntroScreen);
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(IntroductionScreen);

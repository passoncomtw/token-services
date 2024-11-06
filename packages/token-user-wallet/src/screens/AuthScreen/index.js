import { connect } from "react-redux";
import AuthScreen from "./view";
import { initialAppAction } from "~/actions/settingActions";

const mapStateToProps = ({ auth, setting }) => ({
  isAuth: auth.get("isAuth"),
  isInitialed: setting.get("isInitialed"),
});

const mapDispatchToProps = (dispatch) => ({
  handleInitialApp: () => {
    dispatch(initialAppAction());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(AuthScreen);

import color from '../color';
import { fontSize, fontWeight } from '../font';

const navTitleStyle = {
  fontSize: fontSize.h3,
  color: color.white,
  fontWeight: fontWeight.normal,
};

const navTextStyle = {
  fontSize: fontSize.h4,
  color: color.white,
  fontWeight: fontWeight.normal,
};

export const sceneNavStyles = {
  navigationBarStyle: {
    backgroundColor: color.secondary,
    borderBottomWidth: 0,
  },
  backButtonTintColor: color.white,
  titleStyle: navTitleStyle,
  backButtonTextStyle: navTextStyle,
  rightButtonTextStyle: navTextStyle,
};

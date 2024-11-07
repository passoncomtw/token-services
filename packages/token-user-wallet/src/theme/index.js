import color from './color';
import { fontSize, fontWeight } from './font';
import shadow from './shadow';
import spacing from './spacing';
import Button from './components/Button';
import CheckBox from './components/CheckBox';
import { sceneNavStyles } from './components/Scene';
import { tabBarStyle } from './components/Tabs';
import Text from './components/Text';

const theme = {
  colors: color,
  fontSize,
  fontWeights: fontWeight,
  spacing,
  shadowStyle: shadow,

  // for react-native-router-flux's Scene, Tabs
  sceneNavStyles,
  tabBarStyle,

  // overwrite react-native-elements style
  Button,
  CheckBox,
  Text,
};

export default theme;

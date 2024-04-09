import { createTheme } from '@rneui/themed';

export const theme = createTheme({
  colors: {
    secondary: "#EEE",
  },
  // Use only one color scheme
  lightColors: {
    primary: 'red',
  },
  // And set that mode as default
  mode: 'light',
  components: {
    Button: {
      raised: true,
    },
  },
});

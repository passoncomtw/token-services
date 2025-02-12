import { createTheme } from '@material-ui/core/styles';
import basicTheme from '~/theme';

const theme = createTheme({
  ...basicTheme,
  typography: {
    fontFamily: [
      '"Segoe UI"',
      'Avenir',
      '"Chinese Quote"',
      '-apple-system',
      'BlinkMacSystemFont',
      '"PingFang SC"',
      '"Hiragino Sans GB"',
      '"Microsoft YaHei"',
      '"Helvetica Neue"',
      'Helvetica',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    useNextVariants: true,
    fontSize: 10,
    htmlFontSize: 12,
    letterSpacing: -0.3,
    lineHeight: 1.5,
    color: basicTheme.colors.secondary,
    fontWeight: 500,
    ...basicTheme.font,
  },
  shape: {
    borderRadius: 4,
  },
  oshadows: [
    'none',
    '0px 1px 4px rgba(0, 0, 0, 0.12)',
    '0px 1px 3px rgba(0, 0, 0, 0.03), 0px 2px 8px rgba(0, 0, 0, 0.15)',
    '0px 2px 4px rgba(0, 0, 0, 0.05), 0px 3px 12px rgba(0, 0, 0, 0.15)',
    '0px 2px 6px rgba(0, 0, 0, 0.1), 0px 4px 15px rgba(0, 0, 0, 0.2)',
    '0px 1px 3px rgba(0, 0, 0, 0.03), 0px 2px 8px rgba(0, 0, 0, 0.15), 0px 6px 17px rgba(0, 0, 0, 0.2)',
    '0px 2px 4px rgba(0, 0, 0, 0.05), 0px 3px 12px rgba(0, 0, 0, 0.15), 0px 8px 20px rgba(0, 0, 0, 0.2)',
    '0px 2px 6px rgba(0, 0, 0, 0.1), 0px 4px 15px rgba(0, 0, 0, 0.2), 0px 12px 24px rgba(0, 0, 0, 0.2)',
  ],
});

export default theme;

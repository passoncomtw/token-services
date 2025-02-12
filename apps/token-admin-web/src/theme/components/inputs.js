import labelSize from '~/theme/labelSize';
import colors from '~/theme/colors';
import { font } from '~/theme/font';

export const inputFontSize = `${font.h5.fontSize}px`;
export const basicInputStyle = theme => ({
  flex: 1,
  transition: '.2s',
  fontSize: inputFontSize,
  marginRight: theme.spacing(1),
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${colors.linelight}`,
  '&:focus': {
    borderColor: colors.primary,
  },
  '&[disabled]': {
    backgroundColor: colors.linelight,
  },
  '& fieldset:focus': {
    borderColor: colors.primary,
  },
  '& fieldset[disabled]': {
    backgroundColor: colors.linelight,
  },
});

export const basicGroupSelector = {
  '& .MuiSelect-select': {
    paddingRight: 0,
    width: labelSize.lg.groupSelector,
  },
  '&.sm .MuiSelect-select': {
    width: labelSize.sm.groupSelector,
  },
  '&.lg .MuiSelect-select': {
    width: labelSize.lg.groupSelector,
  },
};

export const basicErrorStyle = theme => ({
  borderColor: `${colors.dangerlight} !important`,
  '&:focus': {
    borderColor: `${colors.dangerlight} !important`,
  },
});

export const basicOptionItem = {
  fontSize: inputFontSize,
};

const removeRadiusType = {
  left: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  right: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
};

export const removeBorderRadius = type => removeRadiusType[type];

export const basicDatePickerProps = theme => ({
  root: {
    display: 'flex',
    flex: 1,
  },
  inputRoot: {
    display: 'flex',
    flex: 1,
    '& fieldset': {
      borderColor: colors.linelight,
      height: 36,
    },
    '& .MuiInputAdornment-positionEnd': {
      marginLeft: 0,
    },
  },
  input: {
    fontSize: inputFontSize,
    padding: theme.spacing(1),
    paddingRight: 0,
  },
  disabled: {
    borderColor: colors.linelight,
    backgroundColor: colors.linelight,
  },
  adornedEnd: {
    paddingRight: 0,
  },
  buttonRoot: { width: 35, padding: 5 },
});

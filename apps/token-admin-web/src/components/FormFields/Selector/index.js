import React from 'react';
import propTypes from 'prop-types';
import styled from 'styled-components';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import colors from '~/theme/colors';
import { inputFontSize } from '~/theme/components/inputs';

const StyledSelect = styled(Select)`
  height: 38px;
  min-width: 105px;
  & .MuiOutlinedInput-input {
    padding: 0px;
    padding-left: 24px;
  }
  & fieldset {
    border-width: 1px;
    border-color: ${colors.linelight};
  }
  & .MuiSelect-select {
    font-size: ${inputFontSize}
  }
  & .MuiSelect-select:focus {
    background-color: inherit !important;
  },
`;

const StyledMenuItem = styled(MenuItem)`
  font-size: ${inputFontSize};
`;

const Selector = ({ items, onChange, ...props }) => {
  const handleOnChange = ({ target: { name, value } }) => {
    onChange({ name, value });
  };

  return (
    <StyledSelect variant='outlined' onChange={handleOnChange} {...props}>
      {items.map((item, index) => {
        return (
          <StyledMenuItem value={item.value} key={`${item.value}-${index}`}>
            {item.text}
          </StyledMenuItem>
        );
      })}
    </StyledSelect>
  );
};

Selector.propTypes = {
  defaultValue: propTypes.oneOfType([propTypes.string, propTypes.number]),
  onChange: propTypes.func,
  items: propTypes.arrayOf(
    propTypes.shape({
      value: propTypes.oneOfType([propTypes.string, propTypes.number]),
      text: propTypes.string,
    })
  ),
};

Selector.defaultProps = {
  items: [],
  defaultValue: '',
  onChange: () => {},
};

export default Selector;

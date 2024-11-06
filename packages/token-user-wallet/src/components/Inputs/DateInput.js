import React, { Fragment, useState } from 'react';
import DateTimePicker from 'react-native-modal-datetime-picker';
import { TouchableOpacity } from 'react-native';
import TextInputField from '~/components/Inputs/TextInputField';
import {
  getDateFormatFromDateType,
  getDateFormat,
  DISPLAY_DATE_FORMAT,
} from '~/utils/momentManager';
import theme from '~/theme';
import { Appearance } from 'react-native-appearance';
const colorScheme = Appearance.getColorScheme();
const LOCALE = 'zh_CN';

const DateInput = ({
  label,
  value,
  onChange,
  minimumDate = null,
  maximumDate = null,
}) => {
  const [isDateTimePickerVisible, setVisible] = useState(false);
  const iconName = isDateTimePickerVisible ? 'chevron-up' : 'chevron-down';
  const iconProps = {
    name: iconName,
    size: 12,
    type: 'font-awesome',
    color: theme.colors.greyLighter,
  };

  const openDatePicker = () => setVisible(true);

  const onCancel = () => setVisible(false);

  const onConfirm = (date) => {
    const nextValue = getDateFormatFromDateType(date);
    setVisible(false);
    onChange(nextValue);
  };

  return (
    <Fragment>
      <TouchableOpacity activeOpacity={1} onPress={openDatePicker}>
        <TextInputField
          label={label}
          pointerEvents='none'
          value={getDateFormat(value, DISPLAY_DATE_FORMAT)}
          rightIcon={iconProps}
          onTouchStart={openDatePicker}
        />
      </TouchableOpacity>
      <DateTimePicker
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        isVisible={isDateTimePickerVisible}
        isDarkModeEnabled={colorScheme === 'dark'}
        onConfirm={onConfirm}
        onCancel={onCancel}
        locale={LOCALE}
        cancelTextIOS='取消'
        confirmTextIOS='确认'
        headerTextIOS={`请选择${label}`}
        date={new Date(value)}
      />
    </Fragment>
  );
};

export default DateInput;

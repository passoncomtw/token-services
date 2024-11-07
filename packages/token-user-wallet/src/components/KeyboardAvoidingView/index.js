import React from 'react';
import propTypes from 'prop-types';
import {
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView as BasicKeyboardAvoidingView,
} from 'react-native';

const KeyboardAvoidingView = ({ children, offset = 64 }) => {
  return (
    <BasicKeyboardAvoidingView
      behavior={Platform.OS == 'ios' ? 'padding' : null}
      keyboardVerticalOffset={offset}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        {children}
      </TouchableWithoutFeedback>
    </BasicKeyboardAvoidingView>
  );
};

KeyboardAvoidingView.propTypes = {
  offset: propTypes.number,
};

export default KeyboardAvoidingView;

import React from 'react';
import colors from '~/theme/color';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const Toast = ({ componentId, type, message }) => {

  return (
    <TouchableOpacity style={styles.root} onPress={() => false}>
      <View style={[styles.toast, styles[type]]}>
        <Text style={styles.text}>{message}</Text>
        <TouchableOpacity style={styles.button} onPress={() => false)}>
          <Text style={styles.buttonText}>OK</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'column-reverse',
  },
  success: {
    backgroundColor: colors.success,
  },
  error: {
    backgroundColor: colors.error,
  },
  warning: {
    backgroundColor: colors.warning,
  },
  toast: {
    elevation: 2,
    flexDirection: 'row',
    height: 40,
    margin: 16,
    top: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  text: {
    color: 'white',
    fontSize: 16,
    marginLeft: 16,
  },
  button: {
    marginRight: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

Toast.options = {
  layout: {
    componentBackgroundColor: 'transparent',
  },
  overlay: {
    interceptTouchOutside: false,
  },
};

export default Toast;

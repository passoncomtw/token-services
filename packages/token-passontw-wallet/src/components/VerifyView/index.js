import React from 'react';
import propTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import ViewBox from '~/components/ViewBox';
import SlideVerify from '~/components/SlideVerify';
import ConfirmButton from '~/components/Button/ConfirmButton';

const VerifyView = ({ passProps }) => {
  const { onLogin } = passProps;

  return (
    <ViewBox fill containerStyle={styles.container}>
      <SlideVerify onVerifyPass={onLogin} />
      <ConfirmButton
        title='取消'
        onPress={() => false}
        containerStyle={styles.button}
      />
    </ViewBox>
  );
};

VerifyView.propTypes = {
  passProps: propTypes.object.isRequired,
};

VerifyView.options = {
  topBar: {
    visible: false,
  },
};

export default VerifyView;

const styles = StyleSheet.create({
  container: {
    paddingTop: '45%',
    alignItems: 'center',
  },
  button: {
    marginTop: 100,
    width: '80%',
  },
});

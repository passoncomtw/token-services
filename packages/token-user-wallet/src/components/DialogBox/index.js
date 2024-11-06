import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, Modal, StyleSheet } from 'react-native';
import Content from './Content';
import Footer from './Footer';
import colors from '~/theme/color';

class DialogBox extends PureComponent {
  static propTypes = {
    onConfirm: PropTypes.func.isRequired,
    type: PropTypes.oneOf(['ask', 'confirm', 'update', 'warning']),
    descript: PropTypes.string.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func,
    cancelText: PropTypes.string,
    confirmText: PropTypes.string,
  };

  static defaultProps = {
    descript: '發生錯誤請稍後再試',
    type: 'confirm',
    cancelText: '取消',
    confirmText: '確認',
    onCancel: () => false,
  };

  render() {
    const {
      open,
      descript,
      onConfirm,
      onCancel,
      type,
      cancelText,
      confirmText,
    } = this.props;

    return (
      <Modal
        visible={open}
        key={`modal-${type}-${descript}`}
        transparent
        onRequestClose={() => false}>
        <View style={styles.loadingBox}>
          <View style={styles.dialogWrap}>
            <Content descript={descript} />
            <Footer
              type={type}
              onConfirm={onConfirm}
              onCancel={onCancel}
              cancelText={cancelText}
              confirmText={confirmText}
            />
          </View>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  dialogWrap: {
    width: '80%',
    backgroundColor: colors.white,
    borderRadius: 8,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
});


export default DialogBox;

import { View, StyleSheet } from 'react-native';
import ImageInfoContent from '~/components/ImageInfoContent';
import imgOrderFailed from '~/assets/images/order/imgOrderFailed.png';
import imgOrderSuccess from '~/assets/images/order/imgOrderSuccess.png';

const CompleteModal = ({ passProps }) => {
  const { sourceText, status, hint, action } = passProps;
  const statusText = status ? '完成' : '取消';
  const imageSource = status ? imgOrderSuccess : imgOrderFailed;

  const onConfirm = () => {
    // dismissModal();
    action();
  };

  return (
    <View style={styles.container}>
      <ImageInfoContent
        imageSource={imageSource}
        hint={[hint]}
        onPress={onConfirm}
        btnType='secondary'
        btnTitle={`查看${sourceText}`}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: -60,
  },
});

export default CompleteModal;

import React, { useState } from 'react';
import {
  View,
  Dimensions,
  StyleSheet,
  Image,
  SafeAreaView,
} from 'react-native';
import Carousel from 'react-native-banner-carousel';
import ViewBox from '~/components/ViewBox';
import Button from '~/components/Button';
import page1 from '~/assets/images/introduction/page1.png';
import page2 from '~/assets/images/introduction/page2.png';
import page3 from '~/assets/images/introduction/page3.png';
import theme from '~/theme';

const { width, height } = Dimensions.get('window');

const handleGetActionView = (closeIntroduction) => (page) => {
  if (page < 2) {
    return (
      <Button
        containerStyle={styles.skipText}
        color='secondary'
        type='clear'
        onPress={closeIntroduction}
        title='略过'
      />
    );
  }
  return (
    <ViewBox containerStyle={styles.startBtnContainer}>
      <Button
        title='开始使用'
        containerStyle={styles.startButton}
        onPress={closeIntroduction}
      />
    </ViewBox>
  );
};

const IntroductionScreen = ({ handleHideIntroScreen }) => {
  const [page, setPage] = useState(0);

  const closeIntroduction = () => {
    handleHideIntroScreen();
    // dismiss();
  };

  const getActionView = handleGetActionView(closeIntroduction);

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <Carousel
          delay={1000}
          style={{ width, height }}
          autoplay={false}
          pageInfo={false}
          loop={false}
          pageIndicatorStyle={{ backgroundColor: theme.colors.grey }}
          activePageIndicatorStyle={{ backgroundColor: theme.colors.secondary }}
          onPageChanged={(p) => setPage(p)}>
          <View style={styles.imageContainer}>
            <Image style={[styles.imageSize]} source={page1} />
          </View>
          <View style={styles.imageContainer}>
            <Image style={styles.imageSize} source={page2} />
          </View>
          <View style={styles.imageContainer}>
            <Image style={styles.imageSize} source={page3} />
          </View>
        </Carousel>
        {getActionView(page)}
      </SafeAreaView>
    </View>
  );
};

export default IntroductionScreen;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageSize: {
    width,
    height: height * 0.55,
    aspectRatio: 75 / 82,
  },
  imageContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    top: '-4%',
    width,
    height,
  },
  skipText: {
    position: 'absolute',
    right: '7%',
    top: '7%',
  },
  startBtnContainer: {
    position: 'absolute',
    width: '100%',
    bottom: '15%',
    paddingRight: 25,
    paddingLeft: 25,
    backgroundColor: theme.colors.background,
  },
  startButton: {
    width: 130,
  },
});

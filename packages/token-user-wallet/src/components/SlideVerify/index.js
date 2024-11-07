import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View,
  Image,
  PanResponder,
  Animated,
  TouchableOpacity,
  Easing,
} from 'react-native';
import { Icon, Text } from 'react-native-elements';
import colors from '~/theme/color';

const pieceOffsetX = 75;
const allowableOffsetError = 5;

const puzzleWidth = 300;
const puzzleHeight = 150;
const puzzlePieceWidth = 60;

const generateSlidingStyles = (
  iconName,
  iconColor = 'white',
  buttonColor,
  borderColor = buttonColor,
  indicatorColor
) => ({
  icon: (
    <Icon
      type='feather'
      name={iconName}
      containerStyle={{ width: 25 }}
      color={iconColor}
    />
  ),
  buttonColor,
  borderColor,
  indicatorColor,
});

const slidingStyles = {
  READY: generateSlidingStyles(
    'arrow-right',
    '#5C6167',
    'white',
    '#e4e7eb',
    '#e4e7eb'
  ),
  MOVING: generateSlidingStyles(
    'arrow-right',
    undefined,
    '#1991fa',
    undefined,
    '#d1e9fe'
  ),
  VERIFY_PASS: generateSlidingStyles(
    'check',
    undefined,
    '#52ccba',
    undefined,
    '#d2f4ef'
  ),
  VERIFY_FAIL: generateSlidingStyles(
    'x',
    undefined,
    '#f57a7a',
    undefined,
    '#fce1e1'
  ),
};

const SlideVerify = ({
  puzzle = require('./images/puzzle.jpg'),
  puzzlePiece = require('./images/puzzlePiece.png'),
  showRefresh = false,
  displayType = 'embedded',
  slideTips = '向右滑動左側箭頭填充拼圖',
  refresh = () => false,
  onVerifyPass = () => false,
  onVerifyFaild = () => false,
}) => {
  const [offsetXAnim, setOffsetXAnim] = useState(new Animated.Value(0));
  const [slideStatus, setSlideStatus] = useState(slidingStyles.READY);
  const [moving, setMoving] = useState(false);
  const [result, setResult] = useState(null);
  const [lastResult, setLastResult] = useState(null);

  const hanldeShouldBeResponder = () => lastResult !== true && !moving;

  const handlePanResponderGrant = () => {
    setMoving(true);
    setResult(null);
    setSlideStatus(slidingStyles.MOVING);
  };

  const handlePanResponderMove = () => {
    const maxMoving = puzzleWidth - puzzlePieceWidth;

    return Animated.event([null, { dx: offsetXAnim }], {
      listener: (event, gestureState) => {
        if (gestureState.dx < 0) {
          setOffsetXAnim(0);
        } else if (gestureState.dx > maxMoving) {
          setOffsetXAnim(maxMoving);
        }
      },
    });
  };

  const handlePanResponderRelease = async (event, gestureState) => {
    const offset = gestureState.dx;
    const minOffsetX = pieceOffsetX - allowableOffsetError;
    const maxOffsetX = pieceOffsetX + allowableOffsetError;
    offset >= minOffsetX && offset <= maxOffsetX
      ? handleVerifyPassed()
      : handleVerifyFailed();
  };

  const handleVerifyPassed = () => {
    setMoving(false);
    setResult(false);
    setSlideStatus(slidingStyles.VERIFY_PASS);
    setLastResult(true);

    onVerifyPass();
  };

  const handleVerifyFailed = () => {
    setResult(false);
    setSlideStatus(slidingStyles.VERIFY_FAIL);

    onVerifyFaild();

    Animated.timing(offsetXAnim, {
      toValue: 1,
      delay: 500,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(() => {
      setMoving(false);
      setResult(null);
      setLastResult(true);
      setSlideStatus(slidingStyles.READY);
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: hanldeShouldBeResponder,
      onStartShouldSetPanResponder: hanldeShouldBeResponder,
      onMoveShouldSetPanResponderCapture: hanldeShouldBeResponder,
      onStartShouldSetPanResponderCapture: hanldeShouldBeResponder,

      onPanResponderMove: handlePanResponderMove(),
      onPanResponderGrant: handlePanResponderGrant,
      onPanResponderRelease: handlePanResponderRelease,
    })
  ).current;

  return (
    <View style={{ width: puzzleWidth }}>
      <View
        style={[
          styles.puzzleContainer,
          {
            height: puzzleHeight,
            opacity:
              displayType === 'triggered'
                ? moving || lastResult === false
                  ? 1
                  : 0
                : 1,
          },
          displayType === 'triggered'
            ? { ...StyleSheet.absoluteFillObject, top: -(puzzleHeight + 20) }
            : styles.puzzleContainerEmbedded,
        ]}>
        <Image
          source={puzzle}
          style={[StyleSheet.absoluteFill, { zIndex: 2 }, styles.image]}
        />
        <Animated.View
          style={[
            styles.absoluteFill,
            {
              zIndex: 3,
              transform: [
                { translateX: offsetXAnim },
                // without this line this Animation will not render on Android but working fine on iOS
                { perspective: 1000 },
              ],
            },
          ]}>
          <Image
            source={puzzlePiece}
            style={{ width: puzzlePieceWidth, height: puzzleHeight }}
          />
        </Animated.View>
        {showRefresh && (
          <TouchableOpacity
            onPress={refresh}
            activeOpacity={0.7}
            style={styles.refresh}>
            <Icon
              type='ionicon'
              name='ios-refresh'
              containerStyle={{ width: 35 }}
              color='white'
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.slideBox}>
        <Animated.View
          style={[
            styles.slideIndicator,
            {
              width: offsetXAnim,
              borderColor: slideStatus.borderColor,
              backgroundColor: slideStatus.indicatorColor,
            },
          ]}
        />

        <Animated.View
          style={[
            styles.slider,
            {
              width: puzzlePieceWidth,
              backgroundColor: slideStatus.buttonColor,
              borderColor: slideStatus.borderColor,
              transform: [{ translateX: offsetXAnim }, { perspective: 1000 }],
            },
          ]}
          {...panResponder.panHandlers}>
          {slideStatus.icon}
        </Animated.View>
        {!moving && result === null && (
          <Text style={styles.slideTips}>{slideTips}</Text>
        )}
      </View>
    </View>
  );
};

SlideVerify.propTypes = {
  showRefresh: PropTypes.bool,
  displayType: PropTypes.string,
  puzzle: PropTypes.oneOfType([
    PropTypes.shape({
      uri: PropTypes.string,
    }),
    PropTypes.number,
  ]),
  puzzlePiece: PropTypes.oneOfType([
    PropTypes.shape({
      uri: PropTypes.string,
    }),
    PropTypes.number,
  ]),
  slideTips: PropTypes.string,
  onVerifyPass: PropTypes.func,
  onVerifyFaild: PropTypes.func,
  refresh: PropTypes.func,
};

const styles = StyleSheet.create({
  puzzleContainer: {
    width: '100%',
    elevation: 10,
    shadowRadius: 5,
    shadowOpacity: 0.8,
    shadowColor: colors.grey,
    shadowOffset: { width: 5, height: 5 },
    backgroundColor: colors.background,
  },
  puzzleContainerEmbedded: {
    marginBottom: 50,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  refresh: {
    position: 'absolute',
    right: 5,
    top: 1,
    zIndex: 3,
    backgroundColor: 'transparent',
  },
  slideBox: {
    width: '100%',
    height: 45,
    borderWidth: 1,
    borderColor: colors.greyLighter,
    backgroundColor: colors.greyLighter,
  },
  slideIndicator: {
    height: '100%',
    borderWidth: 1,
    borderRightWidth: 0,
  },
  slider: {
    height: 43,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  slideTips: {
    position: 'absolute',
    left: '30%',
    top: 13,
  },
});

export default SlideVerify;

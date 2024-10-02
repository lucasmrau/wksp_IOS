import {Dimensions} from 'react-native';

type size = number;

const {width, height} = Dimensions.get('window');

const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const horizontalScale = (size: size) => (width / guidelineBaseWidth) * size;
const verticalScale = (size: size) => (height / guidelineBaseHeight) * size;
const moderateScale = (size: size, factor = 0.5) =>
  size + (horizontalScale(size) - size) * factor;

export {horizontalScale, verticalScale, moderateScale};

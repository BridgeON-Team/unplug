import { Dimensions, PixelRatio } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Using iPhone 14 Pro design width/height as baseline (393 x 852)
const BASE_WIDTH = 393;
const BASE_HEIGHT = 852;

const horizontalScale = SCREEN_WIDTH / BASE_WIDTH;
const verticalScale = SCREEN_HEIGHT / BASE_HEIGHT;

export const scale = (size: number) => PixelRatio.roundToNearestPixel(size * horizontalScale);
export const verticalScaleSize = (size: number) => PixelRatio.roundToNearestPixel(size * verticalScale);
export const moderateScale = (size: number, factor = 0.5) =>
  PixelRatio.roundToNearestPixel(size + (scale(size) - size) * factor);

export const responsiveSpacing = (size: number) => moderateScale(size, 0.45);

export const screenWidth = SCREEN_WIDTH;
export const screenHeight = SCREEN_HEIGHT;

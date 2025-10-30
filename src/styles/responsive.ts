import { Dimensions, PixelRatio } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Using iPhone 14 Pro design width/height as baseline (393 x 852)
const BASE_WIDTH = 393;
const BASE_HEIGHT = 852;

// Clamp helper to avoid excessive scaling on very small/large screens
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

// Constrain scale range to keep layout stable across devices
const rawHorizontalScale = SCREEN_WIDTH / BASE_WIDTH;
const rawVerticalScale = SCREEN_HEIGHT / BASE_HEIGHT;
const horizontalScale = clamp(rawHorizontalScale, 0.9, 1.1);
const verticalScale = clamp(rawVerticalScale, 0.9, 1.1);

export const scale = (size: number) => PixelRatio.roundToNearestPixel(size * horizontalScale);
export const verticalScaleSize = (size: number) => PixelRatio.roundToNearestPixel(size * verticalScale);

// Slightly gentler default factor to reduce overflow/underflow risks
export const moderateScale = (size: number, factor = 0.35) =>
  PixelRatio.roundToNearestPixel(size + (scale(size) - size) * factor);

// Spacing should be even more conservative than text by default
export const responsiveSpacing = (size: number) => moderateScale(size, 0.3);

export const screenWidth = SCREEN_WIDTH;
export const screenHeight = SCREEN_HEIGHT;

import { Dimensions, PixelRatio, Platform } from 'react-native';

const guidelineBaseWidth = 390; // iPhone 14 width
const guidelineBaseHeight = 844;
const tabletBreakpoint = 768;
const desktopBreakpoint = 1024;
const smallHandsetBreakpoint = 360;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getViewportScale() {
  const { width, height } = Dimensions.get('window');
  return Math.min(width / guidelineBaseWidth, height / guidelineBaseHeight);
}

function getDeviceCategoryScale() {
  const { width, height } = Dimensions.get('window');
  const smallestSide = Math.min(width, height);

  if (smallestSide >= desktopBreakpoint) {
    return 1.18;
  }

  if (smallestSide >= tabletBreakpoint) {
    return 1.08;
  }

  if (smallestSide <= smallHandsetBreakpoint) {
    return 0.9;
  }

  return 1;
}

function getPlatformAdjustment() {
  if (Platform.OS === 'android') {
    // Android renders fonts slightly larger because of different density rounding.
    return 0.96;
  }

  return 1;
}

export function responsiveFont(
  baseSize: number,
  options?: { min?: number; max?: number; minMultiplier?: number; maxMultiplier?: number }
) {
  const { min, max, minMultiplier = 0.75, maxMultiplier = 1.2 } = options ?? {};
  const viewportScale = getViewportScale();
  const categoryScale = getDeviceCategoryScale();
  const platformScale = getPlatformAdjustment();
  const fontScale = PixelRatio.getFontScale();

  const scaled = baseSize * viewportScale * categoryScale * platformScale;
  const adjusted = PixelRatio.roundToNearestPixel(scaled / fontScale);

  const minSize = min ?? baseSize * minMultiplier;
  const maxSize = max ?? baseSize * maxMultiplier;

  return clamp(adjusted, minSize, maxSize);
}

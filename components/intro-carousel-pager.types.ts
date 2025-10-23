import { ReactNode } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

export type PagerHandle = {
  setPage: (page: number) => void;
};

export type CarouselPagerProps = {
  children: ReactNode;
  initialPage?: number;
  onPageSelected?: (index: number) => void;
  style?: StyleProp<ViewStyle>;
  width: number;
  forwardedRef?: unknown;
};

import { forwardRef, useImperativeHandle, useRef } from 'react';
import PagerView from 'react-native-pager-view';

import type { CarouselPagerProps, PagerHandle } from './intro-carousel-pager.types';

const CarouselPager = forwardRef<PagerHandle, CarouselPagerProps>(
  ({ children, initialPage = 0, onPageSelected, style, forwardedRef }, ref) => {
    const pagerRef = useRef<PagerView>(null);
    // swallow forwardedRef from parent libs (e.g., Tamagui) to prevent DOM warnings
    void forwardedRef;

    useImperativeHandle(ref, () => ({
      setPage(page: number) {
        pagerRef.current?.setPage(page);
      },
    }));

    return (
      <PagerView
        ref={pagerRef}
        style={style}
        initialPage={initialPage}
        onPageSelected={(event) => onPageSelected?.(event.nativeEvent.position)}
      >
        {children}
      </PagerView>
    );
  }
);

CarouselPager.displayName = 'CarouselPagerNative';

export default CarouselPager;
export type { PagerHandle } from './intro-carousel-pager.types';

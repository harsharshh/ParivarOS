import { Children, forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import { ScrollView, View, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';

import type { CarouselPagerProps, PagerHandle } from './intro-carousel-pager.types';

const CarouselPager = forwardRef<PagerHandle, CarouselPagerProps>(
  ({ children, initialPage = 0, onPageSelected, style, width, forwardedRef }, ref) => {
    const scrollRef = useRef<ScrollView>(null);
    const currentPageRef = useRef(initialPage);
    const onPageSelectedRef = useRef(onPageSelected);
    // swallow forwardedRef from parent libs (e.g., Tamagui) to prevent DOM warnings
    void forwardedRef;

    useEffect(() => {
      onPageSelectedRef.current = onPageSelected;
    }, [onPageSelected]);

    const emitPageChange = useCallback(
      (page: number) => {
        currentPageRef.current = page;
        onPageSelectedRef.current?.(page);
      },
      []
    );

    useImperativeHandle(ref, () => ({
      setPage(page: number) {
        emitPageChange(page);
        scrollRef.current?.scrollTo({ x: width * page, animated: true });
      },
    }), [emitPageChange, width]);

    const handleMomentumEnd = useCallback(
      (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const page = Math.round(event.nativeEvent.contentOffset.x / width);
        emitPageChange(page);
      },
      [emitPageChange, width]
    );

    return (
      <ScrollView
        ref={scrollRef}
        style={style}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumEnd}
        onScrollEndDrag={handleMomentumEnd}
        scrollEventThrottle={16}
        contentContainerStyle={{ flexGrow: 1 }}
        onLayout={() => {
          const page = currentPageRef.current;
          scrollRef.current?.scrollTo({ x: width * page, animated: false });
          onPageSelectedRef.current?.(page);
        }}
      >
        {Children.toArray(children).map((child, index) => (
          <View key={index} style={{ width }}>
            {child}
          </View>
        ))}
      </ScrollView>
    );
  }
);

CarouselPager.displayName = 'CarouselPagerWeb';

export default CarouselPager;
export type { PagerHandle } from './intro-carousel-pager.types';

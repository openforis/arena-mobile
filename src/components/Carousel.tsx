import { ReactNode, useCallback, useRef, useState } from "react";
import {
  I18nManager,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { useTheme } from "react-native-paper";
import { useSharedValue } from "react-native-reanimated";
import {
  CarouselItemAnimation,
  CarouselPanGesture,
  CarouselRef,
  Carousel as RNRCarousel,
  Pagination,
} from "react-native-reanimated-carousel";

import { IconButton } from "./IconButton";
import { VView } from "./VView";

// the library follows the native layout direction (not the app language one)
const isRtl = I18nManager.isRTL;

// swipe distances (in points) used to activate/fail the pan gesture
const verticalFailOffset = 10;
const edgeFailOffset = 8;
const farOffset = 100000;

type CarouselProps<T> = {
  // small dots below the items and no previous/next buttons (e.g. nested in another carousel)
  compact?: boolean;
  // height of the items; when not specified, the carousel fills the available space
  height?: number;
  itemAnimation?: CarouselItemAnimation;
  items: T[];
  keyExtractor?: (item: T, index: number) => string;
  renderItem: (item: T, index: number) => ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const Carousel = <T,>(props: CarouselProps<T>) => {
  const {
    compact = false,
    height,
    itemAnimation,
    items,
    keyExtractor,
    renderItem,
    style,
  } = props;

  const theme = useTheme();
  const carouselRef = useRef<CarouselRef>(null);
  const progress = useSharedValue(0);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [activeIndexState, setActiveIndexState] = useState(0);

  const count = items.length;
  const lastIndex = Math.max(0, count - 1);
  const activeIndex = Math.min(activeIndexState, lastIndex);
  const multiple = count > 1;
  const atStart = activeIndex === 0;
  const atEnd = activeIndex === lastIndex;

  const onConfigurePanGesture = useCallback(
    (gesture: CarouselPanGesture) => {
      // a nested carousel activates first, so it gets the swipe
      const activeOffset = compact ? 10 : 20;
      // fail when swiping beyond the first/last item, so an outer carousel (if any) takes over
      const failBackward = atStart ? edgeFailOffset : farOffset;
      const failForward = atEnd ? edgeFailOffset : farOffset;
      gesture
        .activeOffsetX([-activeOffset, activeOffset])
        // vertical swipes go to the scrollable content of the items
        .failOffsetY([-verticalFailOffset, verticalFailOffset])
        .failOffsetX(
          isRtl ? [-failBackward, failForward] : [-failForward, failBackward],
        );
    },
    [atEnd, atStart, compact],
  );

  const renderCarouselItem = useCallback(
    ({ item, index }: { item: T; index: number }) => (
      <View style={styles.item}>{renderItem(item, index)}</View>
    ),
    [renderItem],
  );

  const goToPrevious = useCallback(() => carouselRef.current?.prev(), []);
  const goToNext = useCallback(() => carouselRef.current?.next(), []);
  const goToIndex = useCallback(
    (index: number) => carouselRef.current?.scrollTo({ index, animated: true }),
    [],
  );

  if (count === 0) return null;

  const dotSize = compact ? 6 : 8;
  const pagination = multiple && (
    <Pagination
      activeDotStyle={{
        backgroundColor: theme.colors.primary,
        borderRadius: dotSize / 2,
        height: dotSize,
        width: dotSize * 3,
      }}
      containerStyle={styles.pagination}
      count={count}
      dotStyle={{
        backgroundColor: theme.colors.outlineVariant,
        borderRadius: dotSize / 2,
        height: dotSize,
        width: dotSize,
      }}
      onPress={goToIndex}
      progress={progress}
    />
  );

  const itemsHeight = height ?? size.height;

  return (
    <VView style={[styles.container, !height && styles.fill, style]}>
      <View
        onLayout={(event) => {
          const { width, height: layoutHeight } = event.nativeEvent.layout;
          setSize({ width, height: layoutHeight });
        }}
        style={height ? { height } : styles.fill}
      >
        {size.width > 0 && itemsHeight > 0 && (
          <RNRCarousel
            data={items}
            {...(itemAnimation ? { itemAnimation } : {})}
            keyExtractor={keyExtractor}
            onConfigurePanGesture={onConfigurePanGesture}
            onSnapToItem={setActiveIndexState}
            progress={progress}
            ref={carouselRef}
            renderItem={renderCarouselItem}
            scrollEnabled={multiple}
            style={{ height: itemsHeight, width: size.width }}
          />
        )}
      </View>
      {compact
        ? pagination
        : multiple && (
            <View style={styles.stepper}>
              <IconButton
                avoidMultiplePress={false}
                disabled={atStart}
                icon={isRtl ? "chevron-right" : "chevron-left"}
                onPress={goToPrevious}
              />
              {pagination}
              <IconButton
                avoidMultiplePress={false}
                disabled={atEnd}
                icon={isRtl ? "chevron-left" : "chevron-right"}
                onPress={goToNext}
              />
            </View>
          )}
    </VView>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  fill: {
    flex: 1,
  },
  item: {
    flex: 1,
  },
  pagination: {
    alignItems: "center",
    justifyContent: "center",
  },
  stepper: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

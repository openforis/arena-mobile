import { ReactNode, useCallback, useMemo, useRef, useState } from "react";
import {
  PanResponder,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import Dots from "react-native-dots-pagination";

import { useIsTextDirectionRtl } from "localization";

import { HView } from "./HView";
import { IconButton } from "./IconButton";
import { VView } from "./VView";

// min horizontal swipe distance to go to the previous/next item
const swipeMinDistance = 50;

type CarouselProps<T> = {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const Carousel = <T,>(props: CarouselProps<T>) => {
  const { items, renderItem, style } = props;

  const isRtl = useIsTextDirectionRtl();
  const [activeIndexState, setActiveIndexState] = useState(0);
  const count = items.length;
  const lastIndex = Math.max(0, count - 1);
  // keep the active index in range when the items change
  const activeIndex = Math.min(activeIndexState, lastIndex);

  const goToPrevious = useCallback(
    () => setActiveIndexState((prev) => Math.max(0, prev - 1)),
    [],
  );
  const goToNext = useCallback(
    () => setActiveIndexState((prev) => Math.min(lastIndex, prev + 1)),
    [lastIndex],
  );

  // the pan responder is created once: read the latest callbacks through a ref
  const swipeHandlersRef = useRef({ goToNext, goToPrevious, isRtl });
  swipeHandlersRef.current = { goToNext, goToPrevious, isRtl };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        // claimed on start too: otherwise an ancestor that became responder (e.g. the dialog container) keeps the gesture
        onStartShouldSetPanResponder: () => true,
        // horizontal swipes only, so vertical scrolling of the item content still works
        onMoveShouldSetPanResponder: (_evt, { dx, dy }) =>
          Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 2,
        onPanResponderRelease: (_evt, { dx }) => {
          if (Math.abs(dx) < swipeMinDistance) return;
          const handlers = swipeHandlersRef.current;
          const forward = handlers.isRtl ? dx > 0 : dx < 0;
          if (forward) {
            handlers.goToNext();
          } else {
            handlers.goToPrevious();
          }
        },
      }),
    [],
  );

  if (count === 0) return null;

  return (
    <VView style={[styles.container, style]}>
      {/* RN View: the app View doesn't forward the pan handlers */}
      <View style={styles.item} {...panResponder.panHandlers}>
        {renderItem(items[activeIndex] as T, activeIndex)}
      </View>
      {count > 1 && (
        <HView style={styles.stepper}>
          <IconButton
            avoidMultiplePress={false}
            disabled={activeIndex === 0}
            icon={isRtl ? "chevron-right" : "chevron-left"}
            onPress={goToPrevious}
          />
          <Dots length={count} active={activeIndex} />
          <IconButton
            avoidMultiplePress={false}
            disabled={activeIndex === lastIndex}
            icon={isRtl ? "chevron-left" : "chevron-right"}
            onPress={goToNext}
          />
        </HView>
      )}
    </VView>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  item: {
    flexShrink: 1,
  },
  stepper: {
    alignItems: "center",
    justifyContent: "space-between",
  },
});

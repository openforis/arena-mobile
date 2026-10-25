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

// width of the previous/next buttons in the compact variant (icon + padding + margin)
export const carouselCompactButtonWidth = 40;

type CarouselProps<T> = {
  // small previous/next buttons beside the item and small dots below it (e.g. nested in another carousel)
  compact?: boolean;
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const Carousel = <T,>(props: CarouselProps<T>) => {
  const { compact = false, items, renderItem, style } = props;

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
  const swipeHandlersRef = useRef({
    activeIndex,
    compact,
    goToNext,
    goToPrevious,
    isRtl,
    lastIndex,
  });
  swipeHandlersRef.current = {
    activeIndex,
    compact,
    goToNext,
    goToPrevious,
    isRtl,
    lastIndex,
  };

  const grantPageXRef = useRef(0);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        // claimed on start too: otherwise an ancestor that became responder (e.g. the dialog container) keeps the gesture
        onStartShouldSetPanResponder: () => true,
        // horizontal swipes only, so vertical scrolling of the item content still works
        onMoveShouldSetPanResponder: (_evt, { dx, dy }) =>
          Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 2,
        onPanResponderGrant: (evt) => {
          grantPageXRef.current = evt.nativeEvent.pageX;
        },
        // a nested (compact) carousel keeps the swipe, unless it cannot move further in that direction
        onPanResponderTerminationRequest: (evt) => {
          const { activeIndex, compact, isRtl, lastIndex } =
            swipeHandlersRef.current;
          if (!compact) return true;
          // the gesture state isn't updated yet with the move that triggered the request
          const dx = evt.nativeEvent.pageX - grantPageXRef.current;
          const forward = isRtl ? dx > 0 : dx < 0;
          return forward ? activeIndex === lastIndex : activeIndex === 0;
        },
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

  const previousButton = (
    <IconButton
      avoidMultiplePress={false}
      disabled={activeIndex === 0}
      icon={isRtl ? "chevron-right" : "chevron-left"}
      onPress={goToPrevious}
      size={compact ? 16 : undefined}
      style={compact ? styles.compactButton : undefined}
    />
  );
  const nextButton = (
    <IconButton
      avoidMultiplePress={false}
      disabled={activeIndex === lastIndex}
      icon={isRtl ? "chevron-left" : "chevron-right"}
      onPress={goToNext}
      size={compact ? 16 : undefined}
      style={compact ? styles.compactButton : undefined}
    />
  );
  const multiple = count > 1;

  // RN View: the app View doesn't forward the pan handlers
  const item = (
    <View
      style={[styles.item, compact && styles.compactItem]}
      {...panResponder.panHandlers}
    >
      {renderItem(items[activeIndex] as T, activeIndex)}
    </View>
  );

  if (compact) {
    return (
      <VView style={[styles.compactContainer, style]}>
        <HView style={styles.compactRow}>
          {multiple && previousButton}
          {item}
          {multiple && nextButton}
        </HView>
        {multiple && (
          <Dots
            active={activeIndex}
            activeDotHeight={8}
            activeDotWidth={8}
            length={count}
            passiveDotHeight={6}
            passiveDotWidth={6}
            paddingVertical={0}
          />
        )}
      </VView>
    );
  }

  return (
    <VView style={[styles.container, style]}>
      {item}
      {multiple && (
        <HView style={styles.stepper}>
          {previousButton}
          <Dots length={count} active={activeIndex} />
          {nextButton}
        </HView>
      )}
    </VView>
  );
};

const styles = StyleSheet.create({
  // shrinks with the item, so the controls below stay visible in a container with a max height
  container: {
    flexShrink: 1,
    gap: 8,
  },
  item: {
    flexShrink: 1,
  },
  stepper: {
    alignItems: "center",
    justifyContent: "space-between",
  },
  compactContainer: {
    gap: 8,
  },
  compactRow: {
    alignItems: "center",
    gap: 0,
  },
  compactItem: {
    alignItems: "center",
    flex: 1,
  },
  compactButton: {
    margin: 0,
    width: carouselCompactButtonWidth,
  },
});

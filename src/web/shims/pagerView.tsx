import {
  Children,
  forwardRef,
  ReactNode,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  PointerEvent,
  ScrollView,
  StyleProp,
  View,
  ViewStyle,
} from "react-native";

// native-only props (e.g. offscreenPageLimit, onPageScrollStateChanged) are ignored
type PagerViewProps = {
  children?: ReactNode;
  initialPage?: number;
  onPageSelected?: (e: { nativeEvent: { position: number } }) => void;
  scrollEnabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export type PagerViewRef = {
  setPage: (page: number) => void;
  setPageWithoutAnimation: (page: number) => void;
  setScrollEnabled: (scrollEnabled: boolean) => void;
};

// min horizontal mouse drag distance (px) to go to the previous/next page
const dragMinDistance = 50;

// Web replacement of react-native-pager-view: horizontal ScrollView with paging (CSS scroll snap)
const PagerView = forwardRef<PagerViewRef, PagerViewProps>((props, ref) => {
  const {
    children,
    initialPage = 0,
    onPageSelected,
    scrollEnabled: scrollEnabledProp = true,
    style,
  } = props;

  const scrollViewRef = useRef<ScrollView>(null);
  const pageRef = useRef(initialPage);
  const [width, setWidth] = useState(0);
  const [scrollEnabled, setScrollEnabled] = useState(scrollEnabledProp);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  const scrollToPage = useCallback(
    (page: number, animated: boolean) => {
      // skip when already there, to not fight a scroll in progress started by the user
      if (page === pageRef.current) return;
      pageRef.current = page;
      scrollViewRef.current?.scrollTo({ x: page * width, animated });
    },
    [width],
  );

  useImperativeHandle(
    ref,
    () => ({
      setPage: (page) => scrollToPage(page, true),
      setPageWithoutAnimation: (page) => scrollToPage(page, false),
      setScrollEnabled,
    }),
    [scrollToPage],
  );

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const widthNext = e.nativeEvent.layout.width;
    setWidth(widthNext);
    scrollViewRef.current?.scrollTo({
      x: pageRef.current * widthNext,
      animated: false,
    });
  }, []);

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (width === 0) return;
      const { x } = e.nativeEvent.contentOffset;
      const page = Math.round(x / width);
      // notify only once the scroll stops on a page: during a smooth scroll to another page the
      // intermediate positions would select the starting page again
      if (Math.abs(x - page * width) > 1 || page === pageRef.current) return;
      pageRef.current = page;
      onPageSelected?.({ nativeEvent: { position: page } });
    },
    [onPageSelected, width],
  );

  // desktop browsers don't scroll by dragging with the mouse: emulate the swipe
  const onPointerDown = useCallback((e: PointerEvent) => {
    const { pointerType, button, clientX, clientY } = e.nativeEvent;
    // the event target is a DOM element on web
    const fromTextInput = (e.target as any)?.closest?.("input, textarea");
    dragStartRef.current =
      pointerType === "mouse" && button === 0 && !fromTextInput
        ? { x: clientX, y: clientY }
        : null;
  }, []);

  const onPointerUp = useCallback(
    (e: PointerEvent) => {
      const dragStart = dragStartRef.current;
      dragStartRef.current = null;
      if (!dragStart || !scrollEnabled) return;
      const { clientX, clientY } = e.nativeEvent;
      const dx = clientX - dragStart.x;
      const dy = clientY - dragStart.y;
      if (Math.abs(dx) < dragMinDistance || Math.abs(dx) < 2 * Math.abs(dy))
        return;
      const pagesCount = Children.count(children);
      const page = Math.min(
        Math.max(pageRef.current + (dx < 0 ? 1 : -1), 0),
        pagesCount - 1,
      );
      if (page === pageRef.current) return;
      scrollToPage(page, true);
      onPageSelected?.({ nativeEvent: { position: page } });
    },
    [children, onPageSelected, scrollEnabled, scrollToPage],
  );

  return (
    <View
      style={style}
      onLayout={onLayout}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      <ScrollView
        horizontal
        onScroll={onScroll}
        pagingEnabled
        ref={scrollViewRef}
        scrollEnabled={scrollEnabled}
        scrollEventThrottle={100}
        showsHorizontalScrollIndicator={false}
      >
        {Children.map(children, (child) => (
          <View style={{ width }}>{child}</View>
        ))}
      </ScrollView>
    </View>
  );
});

PagerView.displayName = "PagerView";

export default PagerView;

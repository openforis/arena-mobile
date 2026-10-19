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
      const page = Math.round(e.nativeEvent.contentOffset.x / width);
      if (page === pageRef.current) return;
      pageRef.current = page;
      onPageSelected?.({ nativeEvent: { position: page } });
    },
    [onPageSelected, width],
  );

  return (
    <View style={style} onLayout={onLayout}>
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

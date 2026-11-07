import { useCallback, useState } from "react";
import {
  View as RNView,
  StyleProp,
  StyleSheet,
  TextLayoutEvent,
  TextStyle,
} from "react-native";
import { useTheme } from "react-native-paper";

import { useIsTextDirectionRtl } from "localization";

import { Text } from "./Text";

const styles = StyleSheet.create({
  // same width as the visible text, not shown
  measuringTextContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    opacity: 0,
    pointerEvents: "none",
  },
  toggleLink: {
    alignSelf: "flex-start",
    fontWeight: "bold",
    paddingVertical: 4,
  },
  toggleLinkRtl: {
    alignSelf: "flex-end",
  },
});

type Props = {
  children?: React.ReactNode;
  numberOfLines?: number;
  textStyle?: StyleProp<TextStyle>;
};

export const ViewMoreText = (props: Props) => {
  const { children, numberOfLines = 2, textStyle } = props;

  const isRtl = useIsTextDirectionRtl();
  const theme = useTheme();
  // explicit text color (e.g. on colored backgrounds) wins over the primary color
  const linkColor =
    StyleSheet.flatten(textStyle)?.color ?? theme.colors.primary;
  const [linesCount, setLinesCount] = useState(0);
  const [expanded, setExpanded] = useState(false);

  // counted on a copy without lines limit: with numberOfLines the reported lines differ between Android and iOS
  const onMeasuringTextLayout = useCallback((event: TextLayoutEvent) => {
    setLinesCount(event.nativeEvent.lines.length);
  }, []);

  const toggleExpanded = useCallback(() => {
    setExpanded((expandedPrev) => !expandedPrev);
  }, []);

  return (
    <RNView>
      <Text
        numberOfLines={expanded ? undefined : numberOfLines}
        style={textStyle}
      >
        {children}
      </Text>
      <RNView aria-hidden style={styles.measuringTextContainer}>
        <Text onTextLayout={onMeasuringTextLayout} style={textStyle}>
          {children}
        </Text>
      </RNView>
      {linesCount > numberOfLines && (
        <Text
          onPress={toggleExpanded}
          style={[
            textStyle,
            styles.toggleLink,
            isRtl && styles.toggleLinkRtl,
            { color: linkColor },
          ]}
          textKey={expanded ? "common:viewLess" : "common:viewMore"}
        />
      )}
    </RNView>
  );
};

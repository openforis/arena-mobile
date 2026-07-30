import { StyleSheet, View, ViewProps } from "react-native";
import { Edge, useSafeAreaInsets } from "react-native-safe-area-context";

type ModalSafeAreaViewProps = ViewProps & {
  edges?: Edge[];
};

const defaultEdges: Edge[] = ["top", "right", "bottom", "left"];

const edgeToPaddingProp: Record<
  Edge,
  "paddingTop" | "paddingRight" | "paddingBottom" | "paddingLeft"
> = {
  top: "paddingTop",
  right: "paddingRight",
  bottom: "paddingBottom",
  left: "paddingLeft",
};

// SafeAreaView's own inset measurement is unreliable inside RN's Modal on iOS; use this instead.
export const ModalSafeAreaView = (props: ModalSafeAreaViewProps) => {
  const { edges = defaultEdges, style, children, ...otherProps } = props;
  const insets = useSafeAreaInsets();
  const flatStyle: any = StyleSheet.flatten(style) ?? {};

  const additivePadding = edges.reduce((acc: Record<string, number>, edge) => {
    const paddingProp = edgeToPaddingProp[edge];
    acc[paddingProp] =
      (flatStyle[paddingProp] ?? flatStyle.padding ?? 0) + insets[edge];
    return acc;
  }, {});

  return (
    <View style={[style, additivePadding]} {...otherProps}>
      {children}
    </View>
  );
};

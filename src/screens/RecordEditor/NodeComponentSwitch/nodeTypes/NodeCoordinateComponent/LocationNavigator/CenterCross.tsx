import { StyleSheet, View } from "react-native";

import { CurrentLocationIcon } from "./CurrentLocationIcon";

type CenterCrossProps = {
  size: number;
};

export const CenterCross = ({ size }: CenterCrossProps) => (
  <View
    style={[
      StyleSheet.absoluteFillObject,
      styles.container,
    ]}
  >
    <CurrentLocationIcon size={Math.round(size * 0.1)} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});

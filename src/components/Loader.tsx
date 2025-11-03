import { ActivityIndicator } from "react-native-paper";

import { VView } from "./VView";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({ base: { justifyContent: "center" } });

export const Loader = () => {
  return (
    <VView fullFlex style={styles.base}>
      <ActivityIndicator animating size="large" />
    </VView>
  );
};

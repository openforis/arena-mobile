import { ActivityIndicator } from "react-native-paper";

import { VView } from "./VView";

const style = { justifyContent: "center" };

export const Loader = () => {
  return (
    <VView fullFlex style={style}>
      <ActivityIndicator animating size="large" />
    </VView>
  );
};

import { ActivityIndicator } from "react-native-paper";

import { VView } from "./VView";

const style = { justifyContent: "center" };

export const Loader = () => {
  return (
    // @ts-expect-error TS(7027): Unreachable code detected.
    <VView fullFlex style={style}>
      // @ts-expect-error TS(2749): 'ActivityIndicator' refers to a value, but is bein... Remove this comment to see the full error message
      <ActivityIndicator animating size="large" />
    </VView>
  );
};

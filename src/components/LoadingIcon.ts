import { ActivityIndicator } from "react-native-paper";

export const LoadingIcon = () => {
  // @ts-expect-error TS(7027): Unreachable code detected.
  return <ActivityIndicator animating size="small" />;
};

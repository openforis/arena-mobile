import type { StyleProp, ViewStyle } from "react-native";

export type NodeComponentProps = {
  nodeDef: any;
  nodeUuid?: string;
  parentNodeUuid?: string;
  style?: StyleProp<ViewStyle>;
  wrapperStyle?: StyleProp<ViewStyle>;
};

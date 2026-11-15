import type { NodeDef } from "@openforis/arena-core";
import type { StyleProp, ViewStyle } from "react-native";

export type NodeComponentProps<N extends NodeDef<any> = NodeDef<any>> = {
  nodeDef: N;
  nodeUuid?: string;
  parentNodeUuid?: string;
  style?: StyleProp<ViewStyle>;
  wrapperStyle?: StyleProp<ViewStyle>;
};

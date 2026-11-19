import type { ArenaNodeDef } from "@openforis/arena-core";
import type { StyleProp, ViewStyle } from "react-native";

export type NodeComponentProps<
  N extends ArenaNodeDef<any> = ArenaNodeDef<any>,
> = {
  nodeDef: N;
  nodeUuid?: string;
  parentNodeUuid?: string;
  style?: StyleProp<ViewStyle>;
  wrapperStyle?: StyleProp<ViewStyle>;
};

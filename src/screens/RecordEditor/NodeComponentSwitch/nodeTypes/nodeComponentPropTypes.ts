import type { ArenaAnyNodeDef } from "@openforis/arena-core";
import type { StyleProp, ViewStyle } from "react-native";

export type NodeComponentProps<N extends ArenaAnyNodeDef = ArenaAnyNodeDef> = {
  nodeDef: N;
  nodeUuid?: string;
  parentNodeUuid?: string;
  style?: StyleProp<ViewStyle>;
  wrapperStyle?: StyleProp<ViewStyle>;
};

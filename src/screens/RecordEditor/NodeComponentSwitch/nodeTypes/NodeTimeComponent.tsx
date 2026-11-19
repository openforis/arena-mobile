import { memo } from "react";

import { ArenaNodeDefTime } from "@openforis/arena-core";

import { NodeDateTimeComponent } from "./NodeDateTimeComponent";
import { NodeComponentProps } from "./nodeComponentPropTypes";

type Props = NodeComponentProps<ArenaNodeDefTime>;

export const NodeTimeComponent = memo((props: Props) => (
  <NodeDateTimeComponent mode="time" {...props} />
));

NodeTimeComponent.displayName = "NodeTimeComponent";

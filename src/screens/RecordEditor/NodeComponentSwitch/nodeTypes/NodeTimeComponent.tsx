import { memo } from "react";

import { NodeDateTimeComponent } from "./NodeDateTimeComponent";
import { NodeComponentProps } from "./nodeComponentPropTypes";

export const NodeTimeComponent = memo((props: NodeComponentProps) => (
  <NodeDateTimeComponent mode="time" {...props} />
));

NodeTimeComponent.displayName = "NodeTimeComponent";

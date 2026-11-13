import { memo } from "react";

import { NodeDateTimeComponent } from "./NodeDateTimeComponent";
import { NodeComponentProps } from "./nodeComponentPropTypes";

export const NodeDateComponent = memo((props: NodeComponentProps) => (
  <NodeDateTimeComponent mode="date" {...props} />
));

NodeDateComponent.displayName = "NodeDateComponent";

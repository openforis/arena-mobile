import { memo } from "react";

import { NodeDefDate } from "@openforis/arena-core";

import { NodeDateTimeComponent } from "./NodeDateTimeComponent";
import { NodeComponentProps } from "./nodeComponentPropTypes";

type Props = NodeComponentProps<NodeDefDate>;

export const NodeDateComponent = memo((props: Props) => (
  <NodeDateTimeComponent mode="date" {...props} />
));

NodeDateComponent.displayName = "NodeDateComponent";

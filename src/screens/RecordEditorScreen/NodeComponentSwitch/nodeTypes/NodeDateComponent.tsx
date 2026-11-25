import { memo } from "react";

import { ArenaNodeDefDate } from "@openforis/arena-core";

import { NodeDateTimeComponent } from "./NodeDateTimeComponent";
import { NodeComponentProps } from "./nodeComponentPropTypes";

type Props = NodeComponentProps<ArenaNodeDefDate>;

export const NodeDateComponent = memo((props: Props) => (
  <NodeDateTimeComponent mode="date" {...props} />
));

NodeDateComponent.displayName = "NodeDateComponent";

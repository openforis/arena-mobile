import { memo } from "react";

import { NodeDefEntity } from "@openforis/arena-core";

import { FieldSet } from "components";
import { DataEntrySelectors } from "state";
import { log } from "utils";

import { NodeEntityFormComponent } from "./NodeEntityFormComponent";
import { NodeComponentProps } from "./nodeComponentPropTypes";

type Props = NodeComponentProps<NodeDefEntity>;

export const NodeSingleEntityComponent = memo((props: Props) => {
  const { nodeDef, parentNodeUuid } = props;

  log.debug("rendering NodeSingleEntityComponent");

  const nodeUuid = DataEntrySelectors.useRecordSingleNodeUuid({
    parentNodeUuid,
    nodeDefUuid: nodeDef.uuid,
  });

  if (!nodeUuid) return null;

  return (
    <FieldSet headerKey={nodeDef.props.name}>
      <NodeEntityFormComponent nodeDef={nodeDef} parentNodeUuid={nodeUuid} />
    </FieldSet>
  );
});

NodeSingleEntityComponent.displayName = "NodeSingleEntityComponent";

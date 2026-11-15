import React, { ComponentType, memo } from "react";

import { NodeDefType, NodeDefs } from "@openforis/arena-core";

import { DataEntrySelectors } from "state";

import { Text } from "components";

import { NodeBooleanComponent } from "./nodeTypes/NodeBooleanComponent";
import { NodeCodeComponent } from "./nodeTypes/NodeCodeComponent";
import { NodeCoordinateComponent } from "./nodeTypes/NodeCoordinateComponent";
import { NodeDateComponent } from "./nodeTypes/NodeDateComponent";
import { NodeFileComponent } from "./nodeTypes/NodeFileComponent";
import { NodeGeoComponent } from "./nodeTypes/NodeGeoComponent";
import { NodeTaxonComponent } from "./nodeTypes/NodeTaxonComponent";
import { NodeTextComponent } from "./nodeTypes/NodeTextComponent";
import { NodeTimeComponent } from "./nodeTypes/NodeTimeComponent";
import { NodeComponentProps } from "./nodeTypes/nodeComponentPropTypes";

// keyed by type: each component accepts only its own node def type
const nodeDefComponentByType: Partial<
  Record<NodeDefType, ComponentType<NodeComponentProps<never>>>
> = {
  [NodeDefType.boolean]: NodeBooleanComponent,
  [NodeDefType.code]: NodeCodeComponent,
  [NodeDefType.coordinate]: NodeCoordinateComponent,
  [NodeDefType.date]: NodeDateComponent,
  [NodeDefType.decimal]: NodeTextComponent,
  [NodeDefType.file]: NodeFileComponent,
  [NodeDefType.geo]: NodeGeoComponent,
  [NodeDefType.integer]: NodeTextComponent,
  [NodeDefType.taxon]: NodeTaxonComponent,
  [NodeDefType.text]: NodeTextComponent,
  [NodeDefType.time]: NodeTimeComponent,
};

type Props = NodeComponentProps;

export const SingleAttributeComponentSwitch = memo((props: Props) => {
  const {
    nodeDef,
    nodeUuid: nodeUuidProp,
    parentNodeUuid,
    style,
    wrapperStyle,
  } = props;

  const component = nodeDefComponentByType[NodeDefs.getType(nodeDef)];

  const { nodes } = DataEntrySelectors.useRecordChildNodes({
    parentEntityUuid: parentNodeUuid,
    nodeDef,
  });

  const nodeUuid = nodeUuidProp ?? nodes[0]?.uuid;

  if (!component)
    return <Text textKey={`Type not supported (${nodeDef.type})`} />;

  const componentProps: NodeComponentProps = {
    nodeDef,
    nodeUuid,
    parentNodeUuid,
    style,
    wrapperStyle,
  };
  // keyed by node: the local state of a field must not survive moving to a sibling entity
  return React.createElement(component, {
    // nodeDef type matches the component, looked up by nodeDef.type
    ...(componentProps as NodeComponentProps<never>),
    key: nodeUuid,
  });
});

SingleAttributeComponentSwitch.displayName = "SingleAttributeComponentSwitch";

import React from "react";

import { NodeDefType } from "@openforis/arena-core";

import { DataEntrySelectors } from "state";

import { Text } from "components";

import { NodeBooleanComponent } from "./nodeTypes/NodeBooleanComponent";
import { NodeCodeComponent } from "./nodeTypes/NodeCodeComponent";
import { NodeCoordinateComponent } from "./nodeTypes/NodeCoordinateComponent";
import { NodeDateComponent } from "./nodeTypes/NodeDateComponent";
import { NodeFileComponent } from "./nodeTypes/NodeFileComponent";
import { NodeTaxonComponent } from "./nodeTypes/NodeTaxonComponent";
import { NodeTextComponent } from "./nodeTypes/NodeTextComponent";
import { NodeTimeComponent } from "./nodeTypes/NodeTimeComponent";

const nodeDefComponentByType: Record<string, any> = {
  [NodeDefType.boolean]: NodeBooleanComponent,
  [NodeDefType.code]: NodeCodeComponent,
  [NodeDefType.coordinate]: NodeCoordinateComponent,
  [NodeDefType.date]: NodeDateComponent,
  [NodeDefType.decimal]: NodeTextComponent,
  [NodeDefType.file]: NodeFileComponent,
  [NodeDefType.integer]: NodeTextComponent,
  [NodeDefType.taxon]: NodeTaxonComponent,
  [NodeDefType.text]: NodeTextComponent,
  [NodeDefType.time]: NodeTimeComponent,
};

type Props = {
  nodeDef: any;
  nodeUuid?: string;
  onFocus?: () => void;
  parentNodeUuid?: string;
  style?: any;
  wrapperStyle?: any;
};

export const SingleAttributeComponentSwitch = (props: Props) => {
  const {
    nodeDef,
    nodeUuid: nodeUuidProp,
    onFocus,
    parentNodeUuid,
    style,
    wrapperStyle,
  } = props;

  const component = nodeDefComponentByType[nodeDef.type];

  const { nodes } = DataEntrySelectors.useRecordChildNodes({
    parentEntityUuid: parentNodeUuid,
    nodeDef,
  });

  const nodeUuid = nodeUuidProp ?? nodes[0]?.uuid;

  if (!component)
    return <Text textKey={`Type not supported (${nodeDef.type})`} />;

  return React.createElement(component, {
    nodeDef,
    nodeUuid,
    onFocus,
    parentNodeUuid,
    style,
    wrapperStyle,
  });
};

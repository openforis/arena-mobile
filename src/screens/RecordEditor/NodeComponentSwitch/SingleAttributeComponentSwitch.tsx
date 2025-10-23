import React from "react";
// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

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

const nodeDefComponentByType = {
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

export const SingleAttributeComponentSwitch = (props: any) => {
  const {
    nodeDef,
    nodeUuid: nodeUuidProp,
    onFocus,
    parentNodeUuid,
    style,
    wrapperStyle,
  } = props;

  // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
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

SingleAttributeComponentSwitch.propTypes = {
  nodeDef: PropTypes.object.isRequired,
  nodeUuid: PropTypes.string,
  onFocus: PropTypes.func,
  parentNodeUuid: PropTypes.string,
  style: PropTypes.object,
  wrapperStyle: PropTypes.object,
};

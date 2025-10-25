import { NodeDef } from "@openforis/arena-core";
import PropTypes from "prop-types";

export const NodeValuePreviewPropTypes = {
  nodeDef: PropTypes.object.isRequired,
  value: PropTypes.any,
};

export type NodeValuePreviewProps = {
  nodeDef: NodeDef<any>;
  value: any;
};

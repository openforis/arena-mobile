import PropTypes from "prop-types";

export const NodeComponentPropTypes = {
  nodeDef: PropTypes.object.isRequired,
  nodeUuid: PropTypes.string,
  parentNodeUuid: PropTypes.string,
};

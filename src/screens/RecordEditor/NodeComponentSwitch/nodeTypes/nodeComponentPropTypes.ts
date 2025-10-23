// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

export const NodeComponentPropTypes = {
  nodeDef: PropTypes.object.isRequired,
  nodeUuid: PropTypes.string,
  parentNodeUuid: PropTypes.string,
};

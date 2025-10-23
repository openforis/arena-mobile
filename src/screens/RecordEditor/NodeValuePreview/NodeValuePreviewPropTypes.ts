// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

export const NodeValuePreviewPropTypes = {
  nodeDef: PropTypes.object.isRequired,
  value: PropTypes.any,
};

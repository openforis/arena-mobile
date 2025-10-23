import PropTypes from "prop-types";

import { Icon, Spacer } from "components";

const CollapseIcon = () => <Icon source="chevron-down" />;

const ExpandIcon = () => <Icon source="chevron-up" />;

const LeafNodeIcon = () => <Spacer width={22} />;

export const Indicator = (props) => {
  const { isExpanded, hasChildrenNodes } = props;

  if (!hasChildrenNodes) return <LeafNodeIcon />;
  if (isExpanded) return <CollapseIcon />;
  return <ExpandIcon />;
};

Indicator.propTypes = {
  isExpanded: PropTypes.bool,
  hasChildrenNodes: PropTypes.bool,
};

// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

// @ts-expect-error TS(2307): Cannot find module 'components' or its correspondi... Remove this comment to see the full error message
import { Icon, Spacer } from "components";

// @ts-expect-error TS(2304): Cannot find name 'source'.
const CollapseIcon = () => <Icon source="chevron-down" />;

// @ts-expect-error TS(2304): Cannot find name 'source'.
const ExpandIcon = () => <Icon source="chevron-up" />;

// @ts-expect-error TS(2304): Cannot find name 'width'.
const LeafNodeIcon = () => <Spacer width={22} />;

export const Indicator = (props: any) => {
  const { isExpanded, hasChildrenNodes } = props;

  // @ts-expect-error TS(2749): 'LeafNodeIcon' refers to a value, but is being use... Remove this comment to see the full error message
  if (!hasChildrenNodes) return <LeafNodeIcon />;
  // @ts-expect-error TS(2749): 'CollapseIcon' refers to a value, but is being use... Remove this comment to see the full error message
  if (isExpanded) return <CollapseIcon />;
  // @ts-expect-error TS(2749): 'ExpandIcon' refers to a value, but is being used ... Remove this comment to see the full error message
  return <ExpandIcon />;
};

Indicator.propTypes = {
  isExpanded: PropTypes.bool,
  hasChildrenNodes: PropTypes.bool,
};

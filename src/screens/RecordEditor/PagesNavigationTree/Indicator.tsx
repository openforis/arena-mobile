import { Icon, Spacer } from "components";

const CollapseIcon = () => <Icon source="chevron-down" />;

const ExpandIcon = () => <Icon source="chevron-up" />;

const LeafNodeIcon = () => <Spacer width={22} />;

type IndicatorProps = {
  isExpanded?: boolean;
  hasChildrenNodes?: boolean;
};

export const Indicator = (props: IndicatorProps) => {
  const { isExpanded, hasChildrenNodes } = props;

  if (!hasChildrenNodes) return <LeafNodeIcon />;
  if (isExpanded) return <CollapseIcon />;
  return <ExpandIcon />;
};

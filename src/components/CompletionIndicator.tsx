import { Icon } from "./Icon";

type Props = {
  completionPercent?: number;
  size?: number;
};

const getIndicatorProps = (
  completionPercent: number,
): { source: string; color: string } => {
  if (completionPercent >= 100) return { source: "check-circle", color: "green" };
  if (completionPercent <= 0) return { source: "circle-outline", color: "grey" };
  const slice = Math.min(7, Math.max(1, Math.round((completionPercent / 100) * 8)));
  return { source: `circle-slice-${slice}`, color: "orange" };
};

export const CompletionIndicator = (props: Props) => {
  const { completionPercent, size = 16 } = props;
  if (completionPercent === undefined) return null;
  const { source, color } = getIndicatorProps(completionPercent);
  return <Icon color={color} size={size} source={source} />;
};

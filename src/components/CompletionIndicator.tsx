import { Icon } from "./Icon";

type Props = {
  completionPercent?: number;
  size?: number;
};

export const getCompletionColor = (completionPercent: number): string => {
  if (completionPercent >= 100) return "green";
  if (completionPercent <= 0) return "grey";
  return "orange";
};

const getIndicatorProps = (
  completionPercent: number,
): { source: string; color: string } => {
  const color = getCompletionColor(completionPercent);
  if (completionPercent >= 100) return { source: "check-circle", color };
  if (completionPercent <= 0) return { source: "circle-outline", color };
  const slice = Math.min(8, Math.max(1, Math.round((completionPercent / 100) * 8)));
  return { source: `circle-slice-${slice}`, color };
};

export const CompletionIndicator = (props: Props) => {
  const { completionPercent, size = 16 } = props;
  if (completionPercent === undefined) return null;
  const { source, color } = getIndicatorProps(completionPercent);
  return <Icon color={color} size={size} source={source} />;
};

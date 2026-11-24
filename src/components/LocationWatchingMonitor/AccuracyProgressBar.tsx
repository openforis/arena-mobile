import { ProgressBar } from "../ProgressBar";
import { StyleProp, ViewStyle } from "react-native";

const calculateProgress = ({
  accuracy,
  accuracyThreshold,
}: {
  accuracy?: number;
  accuracyThreshold: number;
}) => {
  if (!accuracy) return { progress: 0.25, color: "red" };

  if (accuracy <= accuracyThreshold) return { progress: 1, color: "green" };

  if (accuracy < 10) return { progress: 0.75, color: "orange" };

  return { progress: 0.5, color: "red" };
};

type Props = {
  accuracy?: number;
  accuracyThreshold: number;
  style?: StyleProp<ViewStyle>;
};

export const AccuracyProgressBar = (props: Props) => {
  const { accuracy, accuracyThreshold, style } = props;

  const { progress, color } = calculateProgress({
    accuracy,
    accuracyThreshold,
  });

  return (
    <ProgressBar
      progress={progress}
      color={color}
      style={[{ margin: 0 }, style]}
    />
  );
};

// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

import { ProgressBar } from "../ProgressBar";

const calculateProgress = ({
  accuracy,
  accuracyThreshold
}: any) => {
  if (!accuracy) return { progress: 0.25, color: "red" };

  if (accuracy <= accuracyThreshold) return { progress: 1, color: "green" };

  if (accuracy < 10) return { progress: 0.75, color: "orange" };

  return { progress: 0.5, color: "red" };
};

export const AccuracyProgressBar = (props: any) => {
  const { accuracy, accuracyThreshold, style } = props;

  const { progress, color } = calculateProgress({
    accuracy,
    accuracyThreshold,
  });

  return (
    // @ts-expect-error TS(2709): Cannot use namespace 'ProgressBar' as a type.
    <ProgressBar
      progress={progress}
      // @ts-expect-error TS(7027): Unreachable code detected.
      color={color}
      // @ts-expect-error TS(2588): Cannot assign to 'style' because it is a constant.
      style={[{ margin: 0 }, style]}
    />
  );
};

AccuracyProgressBar.propTypes = {
  accuracy: PropTypes.number,
  accuracyThreshold: PropTypes.number.isRequired,
  style: PropTypes.object,
};

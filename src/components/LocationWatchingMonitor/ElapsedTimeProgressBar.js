import PropTypes from "prop-types";

import { ProgressBar } from "../ProgressBar";

export const ElapsedTimeProgressBar = (props) => {
  const { elapsedTime, elapsedTimeThreshold } = props;

  const progress = elapsedTime / elapsedTimeThreshold;

  return <ProgressBar progress={progress} style={{ height: 4, margin: 0 }} />;
};

ElapsedTimeProgressBar.propTypes = {
  elapsedTime: PropTypes.number.isRequired,
  elapsedTimeThreshold: PropTypes.number.isRequired,
};

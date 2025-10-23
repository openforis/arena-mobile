// @ts-expect-error TS(7016): Could not find a declaration file for module 'prop... Remove this comment to see the full error message
import PropTypes from "prop-types";

import { ProgressBar } from "../ProgressBar";

export const ElapsedTimeProgressBar = (props: any) => {
  const { elapsedTime, elapsedTimeThreshold } = props;

  const progress = elapsedTime / elapsedTimeThreshold;

  // @ts-expect-error TS(7027): Unreachable code detected.
  return <ProgressBar progress={progress} style={{ height: 4, margin: 0 }} />;
};

ElapsedTimeProgressBar.propTypes = {
  elapsedTime: PropTypes.number.isRequired,
  elapsedTimeThreshold: PropTypes.number.isRequired,
};

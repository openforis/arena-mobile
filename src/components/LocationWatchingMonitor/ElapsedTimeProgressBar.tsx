import { ProgressBar } from "../ProgressBar";

type Props = {
  elapsedTime: number;
  elapsedTimeThreshold: number;
};

export const ElapsedTimeProgressBar = (props: Props) => {
  const { elapsedTime, elapsedTimeThreshold } = props;

  const progress = elapsedTime / elapsedTimeThreshold;

  return <ProgressBar progress={progress} style={{ height: 4, margin: 0 }} />;
};

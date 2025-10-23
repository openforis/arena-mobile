import { useCallback, useState } from "react";

export const useButtonOnPress = ({
  avoidMultiplePress,
  loading,
  multiplePressAvoidanceTimeout = 500,
  onPressProp,
}) => {
  const [temporaryLoading, setTemporaryLoading] = useState(false);

  const actualLoading = loading || temporaryLoading;

  const onPress = useCallback(
    (event) => {
      if (!actualLoading) {
        if (avoidMultiplePress) {
          setTemporaryLoading(true);
          setTimeout(
            () => setTemporaryLoading(false),
            multiplePressAvoidanceTimeout
          );
        }
        onPressProp(event);
      }
    },
    [actualLoading, avoidMultiplePress, onPressProp]
  );

  return { actualLoading, onPress };
};

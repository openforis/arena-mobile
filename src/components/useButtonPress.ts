import { useCallback, useState } from "react";

export const useButtonOnPress = ({
  avoidMultiplePress,
  loading,
  multiplePressAvoidanceTimeout = 500,
  onPressProp,
}: {
  avoidMultiplePress?: boolean;
  loading?: boolean;
  multiplePressAvoidanceTimeout?: number;
  onPressProp?: (event: any) => Promise<void> | void;
}): { actualLoading: boolean; onPress: (event: any) => Promise<void> } => {
  const [temporaryLoading, setTemporaryLoading] = useState(false);

  const actualLoading = loading || temporaryLoading;

  const onPress = useCallback(
    async (event: any) => {
      if (actualLoading) return;

      if (avoidMultiplePress) {
        setTemporaryLoading(true);
        setTimeout(
          () => setTemporaryLoading(false),
          multiplePressAvoidanceTimeout,
        );
      }
      await onPressProp?.(event);
    },
    [
      actualLoading,
      avoidMultiplePress,
      multiplePressAvoidanceTimeout,
      onPressProp,
    ],
  );

  return { actualLoading, onPress };
};

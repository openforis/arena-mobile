import { useCallback, useState } from "react";
import { GestureResponderEvent } from "react-native";

export const useButtonOnPress = ({
  avoidMultiplePress,
  loading,
  multiplePressAvoidanceTimeout = 500,
  onPressProp,
}: {
  avoidMultiplePress?: boolean;
  loading?: boolean;
  multiplePressAvoidanceTimeout?: number;
  onPressProp?: (event: GestureResponderEvent) => Promise<void> | void;
}): {
  actualLoading: boolean;
  onPress: (event: GestureResponderEvent) => Promise<void>;
} => {
  const [temporaryLoading, setTemporaryLoading] = useState(false);

  const actualLoading = loading || temporaryLoading;

  const onPress = useCallback(
    async (event: GestureResponderEvent) => {
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

import { useCallback } from "react";

import { Button } from "components";
import { PositionTrackingActions, useAppDispatch } from "state";

export const DeleteTrackButton = ({ nodeUuid }: { nodeUuid: string }) => {
  const dispatch = useAppDispatch();
  const onPress = useCallback(
    () => dispatch(PositionTrackingActions.deleteTrack({ nodeUuid })),
    [dispatch, nodeUuid],
  );
  return (
    <Button
      compact
      icon="delete"
      color="secondary"
      onPress={onPress}
      textKey="dataEntry:positionTracking.delete"
    />
  );
};

import { useCallback, useState } from "react";

type Params = {
  canEditRecord: boolean;
  contentKey: string;
  keyAttributeFilled: boolean;
  keyAttributeLockAvailable: boolean;
};

export const useKeyAttributeLock = ({
  canEditRecord,
  contentKey,
  keyAttributeFilled,
  keyAttributeLockAvailable,
}: Params) => {
  const [keyAttributeLockState, setKeyAttributeLockState] = useState({
    contentKey,
    locked: false,
  });

  const canDisplayKeyLockButton =
    keyAttributeLockAvailable && canEditRecord && keyAttributeFilled;

  const keyAttributeLocked =
    keyAttributeFilled &&
    keyAttributeLockState.contentKey === contentKey &&
    keyAttributeLockState.locked;

  const onKeyLockButtonPress = useCallback(
    () =>
      setKeyAttributeLockState((statePrev) => ({
        contentKey,
        locked: statePrev.contentKey === contentKey ? !statePrev.locked : true,
      })),
    [contentKey],
  );

  return {
    canDisplayKeyLockButton,
    keyAttributeLocked,
    onKeyLockButtonPress,
  };
};

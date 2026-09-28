import { useSelector } from "react-redux";

import { AutoSyncState } from "./types";

const selectAutoSyncState = (state: any): AutoSyncState => state.autoSync;

const useAutoSyncState = () => useSelector(selectAutoSyncState);

// true while records are being checked against the server (a manual "check status"/"send
// data" or a background auto-sync tick) or while auto-sync's own upload job is in flight.
// The upload job is the only job in the app that runs silently (see actionsAutoSync.ts), so
// isOpen+silent unambiguously identifies it without needing its own dedicated flag.
// Plain (non-hook) version: use this from a thunk (via getState()) right before starting a
// manual export, to check the live value instead of a value a component closure captured
// earlier - a useCallback capturing the hook value below can otherwise go stale mid-flight,
// e.g. if the callback itself is what triggers the "checking" phase it also gates on.
const selectAutoSyncRunning = (state: any) => {
  const { checking } = selectAutoSyncState(state);
  const { isOpen, silent } = state.jobMonitor;
  return checking || (isOpen && silent);
};

const useAutoSyncRunning = () => useSelector(selectAutoSyncRunning);

export const AutoSyncSelectors = {
  selectAutoSyncState,
  selectAutoSyncRunning,
  useAutoSyncState,
  useAutoSyncRunning,
};

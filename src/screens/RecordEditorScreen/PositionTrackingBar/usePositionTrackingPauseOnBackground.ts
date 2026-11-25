import { useEffect } from "react";
import { AppState } from "react-native";

import { PositionTrackingActions, useAppDispatch } from "state";

// tracking runs only in foreground: pause it (writing the track into the record) when the app
// goes to background
export const usePositionTrackingPauseOnBackground = () => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (appState) => {
      if (appState === "background") {
        void dispatch(PositionTrackingActions.pauseTracking());
      }
    });
    return () => subscription.remove();
  }, [dispatch]);
};

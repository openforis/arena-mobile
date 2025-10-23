import { useCallback, useEffect, useState } from "react";
import { Linking } from "react-native";
import { checkVersion } from "react-native-check-version";

// @ts-expect-error TS(2307): Cannot find module 'components' or its correspondi... Remove this comment to see the full error message
import { HView, UpdateStatusIcon } from "components";
// @ts-expect-error TS(2307): Cannot find module 'hooks' or its corresponding ty... Remove this comment to see the full error message
import { useIsNetworkConnected, useToast } from "hooks";
// @ts-expect-error TS(2307): Cannot find module 'model/UpdateStatus' or its cor... Remove this comment to see the full error message
import { UpdateStatus } from "model/UpdateStatus";

import styles from "./versionNumberInfoStyles";
import { ChangelogViewDialog } from "./ChangelogViewDialog";
import { VersionNumberInfoText } from "./VersionNumberInfoText";

export const VersionNumberInfoButton = () => {
  const networkAvailable = useIsNetworkConnected();
  const toaster = useToast();
  const [state, setState] = useState({
    changelogDialogOpen: false,
    updateStatus: UpdateStatus.loading,
    updateStatusError: null,
    updateUrl: null,
  });
  const { changelogDialogOpen, updateStatus, updateStatusError, updateUrl } =
    state;

  useEffect(() => {
    if (networkAvailable) {
      checkVersion()
        .then((result) => {
          const { error, needsUpdate, url } = result ?? {};
          if (error) {
            setState({
              updateStatus: UpdateStatus.error,
              // @ts-expect-error TS(2322): Type 'string' is not assignable to type 'null'.
              updateStatusError: error.toString(),
            });
          } else {
            setState({
              updateStatus: needsUpdate
                ? UpdateStatus.notUpToDate
                : UpdateStatus.upToDate,
              // @ts-expect-error TS(2322): Type 'string' is not assignable to type 'null'.
              updateUrl: url,
            });
          }
        })
        .catch((error) => {
          // @ts-expect-error TS(2345): Argument of type '{ updateStatus: any; updateStatu... Remove this comment to see the full error message
          setState({
            updateStatus: UpdateStatus.error,
            updateStatusError: error.toString(),
          });
        });
    } else {
      // @ts-expect-error TS(2345): Argument of type '{ updateStatus: any; }' is not a... Remove this comment to see the full error message
      setState({ updateStatus: UpdateStatus.networkNotAvailable });
    }
  }, [networkAvailable]);

  const onUpdateConfirm = useCallback(
    // @ts-expect-error TS(2345): Argument of type 'null' is not assignable to param... Remove this comment to see the full error message
    () => Linking.openURL(updateUrl),
    [updateUrl]
  );

  const toggleChangelogViewDialogOpen = useCallback(
    () =>
      setState((statePrev) => ({
        ...statePrev,
        changelogDialogOpen: !statePrev.changelogDialogOpen,
      })),
    []
  );

  const onUpdateStatusIconPress = useCallback(() => {
    switch (updateStatus) {
      case UpdateStatus.error:
        toaster("app:updateStatus.error", { error: updateStatusError });
        break;
      case UpdateStatus.networkNotAvailable:
        toaster("app:updateStatus.networkNotAvailable");
        break;
      case UpdateStatus.upToDate:
        toaster("app:updateStatus.upToDate");
        break;
      case UpdateStatus.notUpToDate:
        toggleChangelogViewDialogOpen();
        break;
    }
  }, [toaster, toggleChangelogViewDialogOpen, updateStatus, updateStatusError]);

  return (
    <HView style={styles.container}>
      <VersionNumberInfoText />
      {updateStatus !== UpdateStatus.error && (
        <UpdateStatusIcon
          updateStatus={updateStatus}
          onPress={onUpdateStatusIconPress}
        />
      )}
      {changelogDialogOpen && (
        <ChangelogViewDialog
          onClose={toggleChangelogViewDialogOpen}
          onUpdate={onUpdateConfirm}
          title="app:updateAvailable"
        />
      )}
    </HView>
  );
};

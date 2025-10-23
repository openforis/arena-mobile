import { useCallback, useEffect, useState } from "react";
import { Linking } from "react-native";
import { checkVersion } from "react-native-check-version";

import { HView, UpdateStatusIcon } from "components";
import { useIsNetworkConnected, useToast } from "hooks";
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
              updateStatusError: error.toString(),
            });
          } else {
            setState({
              updateStatus: needsUpdate
                ? UpdateStatus.notUpToDate
                : UpdateStatus.upToDate,
              updateUrl: url,
            });
          }
        })
        .catch((error) => {
          setState({
            updateStatus: UpdateStatus.error,
            updateStatusError: error.toString(),
          });
        });
    } else {
      setState({ updateStatus: UpdateStatus.networkNotAvailable });
    }
  }, [networkAvailable]);

  const onUpdateConfirm = useCallback(
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

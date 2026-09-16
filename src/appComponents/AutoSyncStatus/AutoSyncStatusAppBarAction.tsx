import { Appbar as RNPAppbar } from "react-native-paper";

import { AutoSyncStatusDialog } from "./AutoSyncStatusDialog";
import { useAutoSyncStatus } from "./useAutoSyncStatus";

/**
 * Same auto-sync status control as AutoSyncStatusIcon, styled as an Appbar.Action for use in
 * a screen's top app bar (e.g. the RecordEditor header) rather than a plain icon button.
 */
export const AutoSyncStatusAppBarAction = () => {
  const { closeDialog, color, dialogVisible, icon, openDialog, syncing } =
    useAutoSyncStatus();

  return (
    <>
      <RNPAppbar.Action
        color={color}
        icon={icon}
        loading={syncing}
        onPress={openDialog}
      />
      <AutoSyncStatusDialog onClose={closeDialog} visible={dialogVisible} />
    </>
  );
};

import { useCallback } from "react";

// @ts-expect-error TS(2307): Cannot find module 'components' or its correspondi... Remove this comment to see the full error message
import { Button } from "components";
// @ts-expect-error TS(2307): Cannot find module 'hooks' or its corresponding ty... Remove this comment to see the full error message
import { useToast } from "hooks";
// @ts-expect-error TS(2307): Cannot find module 'localization' or its correspon... Remove this comment to see the full error message
import { useTranslation } from "localization";
// @ts-expect-error TS(2307): Cannot find module 'service' or its corresponding ... Remove this comment to see the full error message
import { AppService } from "service";
// @ts-expect-error TS(2307): Cannot find module 'utils' or its corresponding ty... Remove this comment to see the full error message
import { Files } from "utils";
// @ts-expect-error TS(2307): Cannot find module 'state/confirm' or its correspo... Remove this comment to see the full error message
import { useConfirm } from "state/confirm";

const style = {
  alignSelf: "center",
  margin: 10,
};

export const FullBackupButton = () => {
  const toaster = useToast();
  const confirm = useConfirm();
  const { t } = useTranslation();

  const onPress = useCallback(async () => {
    const size = await AppService.estimateFullBackupSize();
    const freeDiskStorage = await Files.getFreeDiskStorage();
    if (size > freeDiskStorage) {
      const requiredSpace = Files.toHumanReadableFileSize(
        size - freeDiskStorage
      );
      const details = t("common:notEnoughDiskSpace", { requiredSpace });
      toaster("app:fullBackup.error", { details });
      return;
    }
    if (
      await confirm({
        messageKey: "app:fullBackup.confirmMessage",
        messageParams: { size: Files.toHumanReadableFileSize(size) },
        titleKey: "app:fullBackup.confirmTitle",
      })
    ) {
      try {
        const fullBackupUri = await AppService.generateFullBackup();
        const dialogTitle = t("app:fullBackup.shareTitle");
        await Files.shareFile({ url: fullBackupUri, dialogTitle });
      } catch (error) {
        // @ts-expect-error TS(2571): Object is of type 'unknown'.
        toaster("app:fullBackup.error", { details: error.toString() });
      }
    }
  }, [confirm, t, toaster]);

  return (
    <Button onPress={onPress} style={style} textKey="app:fullBackup.title" />
  );
};

import { useCallback } from "react";
import { StyleSheet } from "react-native";

import { Button } from "components";
import { useToast } from "hooks";
import { useTranslation } from "localization";
import { AppService } from "service";
import { useConfirm } from "state/confirm";
import { Files } from "utils";

const styles = StyleSheet.create({
  base: {
    alignSelf: "center",
    margin: 10,
  },
});

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
        toaster("app:fullBackup.error", { details: String(error) });
      }
    }
  }, [confirm, t, toaster]);

  return (
    <Button
      onPress={onPress}
      style={styles.base}
      textKey="app:fullBackup.title"
    />
  );
};

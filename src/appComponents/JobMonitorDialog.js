import React from "react";
import { Dialog, Portal } from "react-native-paper";

import { useJobMonitor } from "state/jobMonitor/useJobMonitor";

import { Button, ProgressBar, Text } from "components";
import { useTranslation } from "localization";
import { JobStatus } from "@openforis/arena-core";

const progressColorByStatus = {
  [JobStatus.pending]: "yellow",
  [JobStatus.canceled]: "brown",
  [JobStatus.failed]: "red",
  [JobStatus.running]: "blue",
  [JobStatus.succeeded]: "green",
};

export const JobMonitorDialog = () => {
  const { t } = useTranslation();

  const {
    isOpen,
    cancel,
    cancelButtonTextKey,
    close,
    closeButtonTextKey,
    messageKey,
    messageParams,
    progressPercent,
    status,
    titleKey,
  } = useJobMonitor();

  const progress = progressPercent / 100;
  const progressColor = progressColorByStatus[status];

  return (
    <Portal>
      <Dialog visible={isOpen} onDismiss={cancel}>
        <Dialog.Title>{t(titleKey)}</Dialog.Title>
        <Dialog.Content>
          <Text
            variant="bodyMedium"
            textKey={messageKey}
            textParams={messageParams}
          />
          <Text variant="bodyMedium" textKey={`job:status.${status}`} />
          <ProgressBar progress={progress} color={progressColor} />
        </Dialog.Content>
        <Dialog.Actions>
          {[JobStatus.pending, JobStatus.running].includes(status) && (
            <Button
              color="secondary"
              onPress={cancel}
              textKey={cancelButtonTextKey}
            />
          )}
          {[JobStatus.canceled, JobStatus.failed, JobStatus.succeeded].includes(
            status
          ) && (
            <Button
              color="secondary"
              onPress={close}
              textKey={closeButtonTextKey}
            />
          )}
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

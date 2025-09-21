import React from "react";
import { Dialog, Portal } from "react-native-paper";

import { JobStatus } from "@openforis/arena-core";

import { useJobMonitor } from "state/jobMonitor/useJobMonitor";

import { Button, ProgressBar, Text } from "components";
import { useTranslation } from "localization";

const progressColorByStatus = {
  [JobStatus.pending]: "yellow",
  [JobStatus.canceled]: "brown",
  [JobStatus.failed]: "red",
  [JobStatus.running]: "blue",
  [JobStatus.succeeded]: "green",
};

const extractErrorMessages = ({ errors, t }) => {
  const firstLevelErrors = Object.values(errors);
  const secondLevelErrors = firstLevelErrors.flatMap((firstLevelError) =>
    Object.values(firstLevelError)
  );
  const errorItems = secondLevelErrors.reduce((acc, secondLevelError) => {
    acc.push(...(secondLevelError.errors ?? []));
    return acc;
  }, []);
  return errorItems
    .reduce((acc, errorItem) => {
      const { key, params } = errorItem;
      if (key) {
        acc.push(t(key, params));
      }
      return acc;
    }, [])
    .join("\n");
};

export const JobMonitorDialog = () => {
  const { t } = useTranslation();

  const {
    isOpen,
    cancel,
    cancelButtonTextKey,
    close,
    closeButtonTextKey,
    errors,
    messageKey,
    messageParams,
    progressPercent,
    status,
    titleKey,
  } = useJobMonitor();

  const progress = progressPercent / 100;
  const progressColor = progressColorByStatus[status];

  const canCancelJob = [JobStatus.pending, JobStatus.running].includes(status);
  const jobEnded = [
    JobStatus.canceled,
    JobStatus.failed,
    JobStatus.succeeded,
  ].includes(status);

  const errorsText = errors ? extractErrorMessages({ errors, t }) : null;

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
          {status === JobStatus.failed && (
            <Text variant="bodyMedium">{errorsText}</Text>
          )}
        </Dialog.Content>
        <Dialog.Actions>
          {canCancelJob && (
            <Button
              color="secondary"
              onPress={cancel}
              textKey={cancelButtonTextKey}
            />
          )}

          {jobEnded && (
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

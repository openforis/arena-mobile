import React from "react";
import { Dialog, Portal } from "react-native-paper";

import { JobStatus } from "@openforis/arena-core";

import { useJobMonitor } from "state/jobMonitor/useJobMonitor";

import { Button, ProgressBar, Text } from "components";
import { useTranslation } from "localization";
import { Jobs } from "utils";

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
    errors,
    messageKey,
    messageParams,
    progressPercent,
    status,
    titleKey,
  } = useJobMonitor();

  const progress = progressPercent / 100;
  // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
  const progressColor = progressColorByStatus[status];

  const canCancelJob = [JobStatus.pending, JobStatus.running].includes(status);
  const jobEnded = [
    JobStatus.canceled,
    JobStatus.failed,
    JobStatus.succeeded,
  ].includes(status);

  const errorsText = errors ? Jobs.extractErrorMessage({ errors, t }) : null;

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

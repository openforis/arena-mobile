import React from "react";

import { JobStatus } from "@openforis/arena-core";
import { JobMonitorTransferStats } from "./JobMonitorTransferStats";

import { useJobMonitor } from "state/jobMonitor/useJobMonitor";

import { Dialog, ProgressBar, Text } from "components";
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
    showTransferStats,
    transferTotalBytes,
    transferSpeedBytesPerSec,
    transferSizeTextKey,
    transferSpeedTextKey,
    transferEtaTextKey,
    etaSeconds,
  } = useJobMonitor();

  const progress = progressPercent / 100;
  const progressColor = progressColorByStatus[status as JobStatus];

  const canCancelJob = [JobStatus.pending, JobStatus.running].includes(status);
  const jobEnded = [
    JobStatus.canceled,
    JobStatus.failed,
    JobStatus.succeeded,
  ].includes(status);

  const errorsText = errors ? Jobs.extractErrorMessage({ errors, t }) : null;

  const actions = [
    ...(canCancelJob
      ? [{ onPress: cancel, textKey: cancelButtonTextKey }]
      : []),
    ...(jobEnded ? [{ onPress: close, textKey: closeButtonTextKey }] : []),
  ];

  return (
    <Dialog
      actions={actions}
      dismissable={false}
      showCloseButton={false}
      title={titleKey}
      visible={!!isOpen}
    >
      <Text
        variant="bodyMedium"
        textKey={messageKey}
        textParams={messageParams}
      />

      <Text variant="bodyMedium" textKey={`job:status.${status}`} />

      <ProgressBar progress={progress} color={progressColor} />

      <JobMonitorTransferStats
        status={status}
        showTransferStats={showTransferStats}
        transferTotalBytes={transferTotalBytes}
        transferSpeedBytesPerSec={transferSpeedBytesPerSec}
        transferSizeTextKey={transferSizeTextKey}
        transferSpeedTextKey={transferSpeedTextKey}
        transferEtaTextKey={transferEtaTextKey}
        etaSeconds={etaSeconds}
      />
      {status === JobStatus.failed && (
        <Text variant="bodyMedium">{errorsText}</Text>
      )}
    </Dialog>
  );
};

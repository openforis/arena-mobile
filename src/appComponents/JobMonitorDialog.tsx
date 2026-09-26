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
    combinedProgressPercent,
    errors,
    messageKey,
    messageParams,
    silent,
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

  // combinedProgressPercent folds a multi-phase chain's separate jobs (e.g. exportRecords' zip
  // preparation -> upload -> server-side processing) into one continuous bar - see
  // JobMonitorState.progressRangeStart/End; equal to the current job's own progress otherwise
  // -1 means unknown progress: show an indeterminate bar instead of passing a negative value
  const progressUnknown =
    typeof combinedProgressPercent !== "number" || combinedProgressPercent < 0;
  const progress = progressUnknown ? 0 : combinedProgressPercent / 100;
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
      visible={!!isOpen && !silent}
    >
      <Text
        variant="bodyMedium"
        textKey={messageKey}
        textParams={messageParams}
      />

      <Text variant="bodyMedium" textKey={`job:status.${status}`} />

      <ProgressBar
        color={progressColor}
        indeterminate={progressUnknown && !jobEnded}
        progress={progress}
      />

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

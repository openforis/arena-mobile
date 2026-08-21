import React from "react";

import { JobStatus } from "@openforis/arena-core";

import { useJobMonitor } from "state/jobMonitor/useJobMonitor";

import { Dialog, ProgressBar, Text } from "components";
import { TranslateFunction, useTranslation } from "localization";
import { Files, Jobs, TimeUtils } from "utils";

const progressColorByStatus = {
  [JobStatus.pending]: "yellow",
  [JobStatus.canceled]: "brown",
  [JobStatus.failed]: "red",
  [JobStatus.running]: "blue",
  [JobStatus.succeeded]: "green",
};

const generateEtaText = (etaSeconds: any, t: TranslateFunction) => {
  if (etaSeconds === 0) {
    return t("common:timePart.second", { count: 0 });
  }
  return TimeUtils.formatRemainingTimeIfLessThan1Day({
    time: etaSeconds * 1000,
    t,
    formatMode: TimeUtils.formatModes.short,
  }) ||
    TimeUtils.formatRemainingTime({
      time: etaSeconds * 1000,
      t,
      upToTimePart: "day",
    });
}

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

  const transferSpeedText =
    showTransferStats && transferSpeedBytesPerSec
      ? Files.toHumanReadableFileSize(transferSpeedBytesPerSec, {
        decimalPlaces: 1,
      })
      : null;

  const transferSizeText =
    showTransferStats && transferTotalBytes != null
      ? Files.toHumanReadableFileSize(transferTotalBytes, {
        decimalPlaces: 1,
      })
      : null;

  const etaText = showTransferStats && etaSeconds != null ? generateEtaText(etaSeconds, t) : null

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
      {showTransferStats && status === JobStatus.running && (
        <>
          {!!transferSizeText && !!transferSizeTextKey && (
            <Text
              variant="bodySmall"
              textKey={transferSizeTextKey}
              textParams={{ size: transferSizeText }}
            />
          )}
          {!!transferSpeedText && !!transferSpeedTextKey && (
            <Text
              variant="bodySmall"
              textKey={transferSpeedTextKey}
              textParams={{ speed: transferSpeedText }}
            />
          )}
          {!!etaText && !!transferEtaTextKey && (
            <Text
              variant="bodySmall"
              textKey={transferEtaTextKey}
              textParams={{ eta: etaText }}
            />
          )}
        </>
      )}
      {status === JobStatus.failed && (
        <Text variant="bodyMedium">{errorsText}</Text>
      )}
    </Dialog>
  );
};

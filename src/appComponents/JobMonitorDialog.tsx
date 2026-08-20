import React from "react";

import { JobStatus } from "@openforis/arena-core";

import { useJobMonitor } from "state/jobMonitor/useJobMonitor";

import { Dialog, ProgressBar, Text } from "components";
import { useTranslation } from "localization";
import { Files, Jobs, TimeUtils } from "utils";

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
    showUploadStats,
    uploadSpeedBytesPerSec,
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

  const uploadSpeedText =
    showUploadStats && uploadSpeedBytesPerSec
      ? Files.toHumanReadableFileSize(uploadSpeedBytesPerSec, {
        decimalPlaces: 1,
      })
      : null;
  const etaText =
    showUploadStats && etaSeconds != null
      ? etaSeconds === 0
        ? t("common:timePart.second", { count: 0 })
        : TimeUtils.formatRemainingTimeIfLessThan1Day({
          time: etaSeconds * 1000,
          t,
          formatMode: TimeUtils.formatModes.short,
        }) ||
        TimeUtils.formatRemainingTime({
          time: etaSeconds * 1000,
          t,
          upToTimePart: "day",
        })
      : null;

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
      {showUploadStats && status === JobStatus.running && (
        <>
          {!!uploadSpeedText && (
            <Text
              variant="bodySmall"
              textKey="dataEntry:uploadingData.speed"
              textParams={{ speed: uploadSpeedText }}
            />
          )}
          {!!etaText && (
            <Text
              variant="bodySmall"
              textKey="dataEntry:uploadingData.eta"
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

import React from "react";

import { JobStatus } from "@openforis/arena-core";

import { Text } from "components";
import { TranslateFunction, useTranslation } from "localization";
import { Files, TimeUtils } from "utils";

type JobMonitorTransferStatsProps = {
    status: JobStatus;
    showTransferStats: boolean;
    transferTotalBytes: number | null;
    transferSpeedBytesPerSec: number | null;
    transferSizeTextKey?: string | null;
    transferSpeedTextKey?: string | null;
    transferEtaTextKey?: string | null;
    etaSeconds: number | null;
};

const generateEtaText = (etaSeconds: number, t: TranslateFunction) => {
    if (etaSeconds === 0) {
        return t("common:timePart.second", { count: 0 });
    }
    return (
        TimeUtils.formatRemainingTimeIfLessThan1Day({
            time: etaSeconds * 1000,
            t,
            formatMode: TimeUtils.formatModes.short,
        }) ||
        TimeUtils.formatRemainingTime({
            time: etaSeconds * 1000,
            t,
            upToTimePart: "day",
        })
    );
};

export const JobMonitorTransferStats = ({
    status,
    showTransferStats,
    transferTotalBytes,
    transferSpeedBytesPerSec,
    transferSizeTextKey,
    transferSpeedTextKey,
    transferEtaTextKey,
    etaSeconds,
}: JobMonitorTransferStatsProps) => {
    const { t } = useTranslation();

    if (!showTransferStats || status !== JobStatus.running) {
        return null;
    }

    const transferSizeText =
        transferTotalBytes != null
            ? Files.toHumanReadableFileSize(transferTotalBytes, {
                decimalPlaces: 1,
            })
            : null;

    const transferSpeedText =
        transferSpeedBytesPerSec
            ? Files.toHumanReadableFileSize(transferSpeedBytesPerSec, {
                decimalPlaces: 1,
            })
            : null;

    const etaText =
        etaSeconds != null ? generateEtaText(etaSeconds, t) : null;

    return (
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
    );
};

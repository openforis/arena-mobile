import { JobStatus, ValidationFields } from "@openforis/arena-core";

export type JobMonitorState = {
    isOpen: boolean;
    titleKey: string;
    cancelButtonTextKey: string;
    closeButtonTextKey: string;
    errors?: ValidationFields;
    etaSeconds: number | null;
    messageKey?: string;
    messageParams?: any;
    progressPercent: number;
    status: JobStatus;
    showTransferStats: boolean;
    transferTotalBytes: number | null;
    transferSpeedBytesPerSec: number | null;
    transferSizeTextKey?: string | null;
    transferSpeedTextKey?: string | null;
    transferEtaTextKey?: string | null;
};
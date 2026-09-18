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
    // where this job's own 0-100% progress maps to within a larger multi-job operation (e.g.
    // auto-sync's zip preparation -> upload -> server-side processing chain, each a separate job
    // - see actionsDataExport.ts): [0, 100] (the default) for a job that isn't part of a chain,
    // so useJobMonitor's combinedProgressPercent then equals progressPercent unchanged
    progressRangeStart: number;
    progressRangeEnd: number;
    silent: boolean;
    status: JobStatus;
    showTransferStats: boolean;
    transferTotalBytes: number | null;
    transferSpeedBytesPerSec: number | null;
    transferSizeTextKey?: string | null;
    transferSpeedTextKey?: string | null;
    transferEtaTextKey?: string | null;
};
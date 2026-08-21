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
    showUploadStats: boolean;
    uploadSpeedBytesPerSec: number | null;
}
import { JobMobileContext } from "model";

// shared by RecordsUploadAndProcessJob and both of its inner jobs (RecordsUploadJob,
// RemoteJobWatcherJob) - JobBase requires a composite job and all of its inner jobs to share the
// exact same context type, since executeJobs() hands each inner job the SAME context object
// reference as the parent (see RecordsUploadAndProcessJob). Kept in its own file (matching
// RecordsAndFilesImportJobContext) so recordsUploadJob.ts/remoteJobWatcherJob.ts can import it
// without a circular import back through recordsUploadAndProcessJob.ts.
// only `user` (via JobMobileContext) is required - the rest are optional here (even though
// RecordsUploadAndProcessJob always provides them) because each inner job's own constructor
// only needs to pass what IT specifically uses; the parent's full context - already carrying
// all of these - replaces it by reference before execute() runs (see executeJobs() in
// JobBase), matching RecordsAndFilesImportJobContext's same convention
export type RecordsUploadAndProcessJobContext = JobMobileContext & {
  cycle?: string;
  fileUri?: string;
  conflictResolutionStrategy?: string;
  skipMissingFiles?: boolean;
  // written by RecordsUploadJob once the upload completes, read by RemoteJobWatcherJob - see
  // both jobs' own execute()
  remoteJobUuid?: string;
};

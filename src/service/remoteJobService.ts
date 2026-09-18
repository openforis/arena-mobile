import { RemoteService } from "./remoteService";

const fetchActiveJob = async () => RemoteService.get("api/jobs/active");

// best-effort: cancels the current user's active job (e.g. the data restore job running after
// a records upload) - the server may not be able to actually stop it, or may take a while to
// notice
const cancelActiveJob = async () => RemoteService.del("api/jobs/active");

export const RemoteJobService = {
  fetchActiveJob,
  cancelActiveJob,
};

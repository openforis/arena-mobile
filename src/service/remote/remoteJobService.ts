import { RemoteService } from "./remoteService";

const fetchJob = async (jobUuid: string) =>
  RemoteService.get(`api/jobs/${jobUuid}`);

// best-effort: cancels the current user's active job (e.g. the data restore job running after
// a records upload) - the server may not be able to actually stop it, or may take a while to
// notice
const cancelActiveJob = async () => RemoteService.del("api/jobs/active");

export const RemoteJobService = {
  fetchJob,
  cancelActiveJob,
};

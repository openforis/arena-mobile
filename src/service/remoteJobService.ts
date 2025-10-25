import { RemoteService } from "./remoteService";

const fetchActiveJob = async () => RemoteService.get("api/jobs/active");

export const RemoteJobService = {
  fetchActiveJob,
};

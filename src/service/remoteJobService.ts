import { RemoteService } from "./remoteService";

// @ts-expect-error TS(2554): Expected 2-3 arguments, but got 1.
const fetchActiveJob = async () => RemoteService.get("api/jobs/active");

export const RemoteJobService = {
  fetchActiveJob,
};

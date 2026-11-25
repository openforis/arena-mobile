import { JobStatus } from "@openforis/arena-core";

import type {
  RecordsUploadAndProcessJobContext,
  RecordsUploadState,
} from "./RecordsUploadAndProcessJobContext";
import { RecordService } from "../../recordService";
import { RecordsUploadJob } from "./RecordsUploadJob";

jest.mock("model", () => jest.requireActual("model/JobMobile"));

jest.mock("utils/Logger");
jest.mock("utils/Files", () => ({ Files: {} }));

jest.mock("../../recordService", () => ({
  RecordService: { uploadRecordsToRemoteServer: jest.fn() },
}));

const uploadMock = RecordService.uploadRecordsToRemoteServer as jest.Mock;

const createJob = (uploadState: RecordsUploadState) =>
  new RecordsUploadJob({
    user: {},
    survey: {},
    uploadState,
  } as RecordsUploadAndProcessJobContext);

describe("RecordsUploadJob", () => {
  it("continues from the first chunk not confirmed by the server", async () => {
    const uploadState = { fileId: "file-1", chunkSize: 2048, nextChunk: 1 };

    uploadMock.mockImplementationOnce(({ onChunkUploaded }) => {
      onChunkUploaded(1);
      onChunkUploaded(2);
      return { promise: Promise.reject(new Error("network")), cancel() {} };
    });
    await expect(createJob(uploadState).execute()).rejects.toThrow("network");

    uploadMock.mockReturnValueOnce({
      promise: Promise.resolve({ data: { job: { uuid: "remote-job" } } }),
      cancel() {},
    });
    await createJob(uploadState).execute();

    expect(uploadMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        fileId: "file-1",
        startFromChunk: 3,
        chunkSize: 2048,
      }),
    );
  });

  it("ends as canceled when the upload is canceled", async () => {
    const { CanceledError } = jest.requireActual("axios");
    let rejectUpload: (error: unknown) => void = () => {};
    uploadMock.mockReturnValueOnce({
      promise: new Promise((_resolve, reject) => {
        rejectUpload = reject;
      }),
      cancel: () => rejectUpload(new CanceledError()),
    });
    const job = createJob({ fileId: "file-1", chunkSize: 2048, nextChunk: 1 });

    const execution = job.start();
    await new Promise(process.nextTick);
    await job.cancel();
    await execution;

    expect(job.status).toBe(JobStatus.canceled);
  });
});

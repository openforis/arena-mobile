import { RecordService } from "./recordService";
import { RecordsUploadJob } from "./recordsUploadJob";

jest.mock("model", () => jest.requireActual("model/JobMobile"));

jest.mock("utils/Logger", () => ({
  log: { debug: jest.fn(), error: jest.fn() },
}));

jest.mock("./recordService", () => ({
  RecordService: { uploadRecordsToRemoteServer: jest.fn() },
}));

const uploadMock = RecordService.uploadRecordsToRemoteServer as jest.Mock;

const createJob = (uploadState: any) =>
  new RecordsUploadJob({ user: {}, survey: {}, uploadState });

describe("RecordsUploadJob", () => {
  beforeEach(() => jest.clearAllMocks());

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
});

import { RecordRemoteService } from "./recordRemoteService";
import { RemoteService } from "./remoteService";
import { Files } from "utils";

let mockFileDeletionsBeforeRetry = 0;

jest.mock("./remoteService", () => ({
  RemoteService: { postCancelableMultipartData: jest.fn() },
}));

jest.mock("utils", () => {
  const Files = { del: jest.fn() };
  return {
    Files,
    Functions: { throttle: (fn: any) => fn },
    log: { debug: jest.fn() },
    RNFileProcessor: class {
      chunkProcessor: any;
      onError: any;
      constructor({ chunkProcessor, onError }: any) {
        this.chunkProcessor = chunkProcessor;
        this.onError = onError;
      }
      start() {
        const processChunk = () =>
          this.chunkProcessor({
            chunk: 1,
            content: { uri: "file://chunk.tmp" },
            totalChunks: 2,
            totalFileSize: 10,
          });
        processChunk()
          .catch(() => {
            mockFileDeletionsBeforeRetry = Files.del.mock.calls.length;
            return processChunk();
          })
          .catch(this.onError);
      }
      close() {}
      stop() {}
    },
  };
});

const postMock = RemoteService.postCancelableMultipartData as jest.Mock;

const upload = (onChunkUploaded: jest.Mock) =>
  RecordRemoteService.uploadRecords({
    survey: { remoteId: 1 } as any,
    cycle: "0",
    fileUri: "file://records.zip",
    fileId: "file-1",
    conflictResolutionStrategy: "overwriteIfUpdated",
    onChunkUploaded,
    onUploadProgress: jest.fn(),
  });

describe("RecordRemoteService.uploadRecords", () => {
  beforeEach(() => jest.clearAllMocks());

  it("does not count a chunk the server has not confirmed", async () => {
    let sendProgress: (event: any) => void = () => {};
    postMock.mockImplementation(async (_uri, _params, onProgress) => {
      sendProgress = onProgress;
      return { promise: Promise.reject(new Error("network")), cancel() {} };
    });
    const onChunkUploaded = jest.fn();

    await expect(upload(onChunkUploaded).promise).rejects.toThrow("network");
    sendProgress({ progress: 1 });

    expect(onChunkUploaded).not.toHaveBeenCalled();
  });

  it("keeps the chunk file for the retry, then deletes it", async () => {
    postMock.mockImplementation(async () => ({
      promise: Promise.reject(new Error("network")),
      cancel() {},
    }));

    await expect(upload(jest.fn()).promise).rejects.toThrow("network");

    expect(mockFileDeletionsBeforeRetry).toBe(0);
    expect(Files.del).toHaveBeenCalledWith("file://chunk.tmp", true);
  });
});

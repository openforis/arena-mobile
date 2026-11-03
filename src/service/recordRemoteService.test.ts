import { CanceledError } from "axios";

import { RecordRemoteService } from "./recordRemoteService";
import { RemoteService } from "./remoteService";
import { Files } from "utils";

let mockFileDeletionsBeforeRetry = 0;
let mockTotalChunks = 2;
const mockClose = jest.fn();

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
      onComplete: any;
      close = mockClose;
      stop = jest.fn();
      constructor({ chunkProcessor, onError, onComplete }: any) {
        this.chunkProcessor = chunkProcessor;
        this.onError = onError;
        this.onComplete = onComplete;
      }
      start(startFromChunk = 1) {
        const totalChunks = mockTotalChunks;
        if (totalChunks === 0) return this.onComplete();
        const processChunk = () =>
          this.chunkProcessor({
            chunk: startFromChunk,
            content: { uri: "file://chunk.tmp" },
            totalChunks,
            totalFileSize: 10,
          });
        processChunk()
          .catch(() => {
            mockFileDeletionsBeforeRetry = Files.del.mock.calls.length;
            return processChunk();
          })
          .then((result: any) => {
            if (startFromChunk >= totalChunks) this.onComplete(result);
          }, this.onError);
      }
    },
  };
});

const postMock = RemoteService.postCancelableMultipartData as jest.Mock;

const upload = (onChunkUploaded: jest.Mock = jest.fn(), startFromChunk = 1) =>
  RecordRemoteService.uploadRecords({
    startFromChunk,
    survey: { remoteId: 1 } as any,
    cycle: "0",
    fileUri: "file://records.zip",
    fileId: "file-1",
    conflictResolutionStrategy: "overwriteIfUpdated",
    onChunkUploaded,
    onUploadProgress: jest.fn(),
  });

describe("RecordRemoteService.uploadRecords", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTotalChunks = 2;
  });

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

  it("rejects and closes the file when canceled", async () => {
    postMock.mockImplementation(async () => ({
      promise: new Promise(() => {}),
      cancel() {},
    }));
    const { promise, cancel } = upload();
    await new Promise(process.nextTick);
    cancel();

    await expect(promise).rejects.toBeInstanceOf(CanceledError);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it("resolves with the response of the last chunk", async () => {
    postMock.mockImplementation(async () => ({
      promise: Promise.resolve({ data: { job: {} } }),
      cancel() {},
    }));

    await expect(upload(jest.fn(), 2).promise).resolves.toEqual({
      data: { job: {} },
    });
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it("rejects when the file is empty", async () => {
    mockTotalChunks = 0;

    await expect(upload().promise).rejects.toThrow("nothing to upload");
    expect(postMock).not.toHaveBeenCalled();
  });

  it("rejects when starting after the last chunk", async () => {
    await expect(upload(jest.fn(), 3).promise).rejects.toThrow("out of range");
    expect(postMock).not.toHaveBeenCalled();
  });
});

import { RecordRemoteService } from "./recordRemoteService";
import { RemoteService } from "./remoteService";

jest.mock("./remoteService", () => ({
  RemoteService: { postCancelableMultipartData: jest.fn() },
}));

jest.mock("utils", () => ({
  Files: { del: jest.fn() },
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
      this.chunkProcessor({
        chunk: 1,
        content: {},
        totalChunks: 2,
        totalFileSize: 10,
      }).catch(this.onError);
    }
    close() {}
    stop() {}
  },
}));

const postMock = RemoteService.postCancelableMultipartData as jest.Mock;

describe("RecordRemoteService.uploadRecords", () => {
  it("does not count a chunk the server has not confirmed", async () => {
    let sendProgress: (event: any) => void = () => {};
    postMock.mockImplementationOnce(async (_uri, _params, onProgress) => {
      sendProgress = onProgress;
      return { promise: Promise.reject(new Error("network")), cancel() {} };
    });
    const onChunkUploaded = jest.fn();

    const { promise } = RecordRemoteService.uploadRecords({
      survey: { remoteId: 1 } as any,
      cycle: "0",
      fileUri: "file://records.zip",
      fileId: "file-1",
      conflictResolutionStrategy: "overwriteIfUpdated",
      onChunkUploaded,
      onUploadProgress: jest.fn(),
    });

    await expect(promise).rejects.toThrow("network");
    sendProgress({ progress: 1 });
    expect(onChunkUploaded).not.toHaveBeenCalled();
  });
});

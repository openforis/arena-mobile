import { RecordFileService } from "./recordFileService";
import { RecordService } from "./recordService";
import { RecordRepository } from "./repository/recordRepository";

jest.mock("./repository/recordRepository", () => ({
  RecordRepository: {
    deleteRecords: jest.fn(),
    fetchRecordsFileUuids: jest.fn(),
  },
}));
jest.mock("./recordRemoteService", () => ({ RecordRemoteService: {} }));
jest.mock("./recordFileService", () => ({
  RecordFileService: { deleteRecordFile: jest.fn() },
}));
jest.mock("./areaOfInterestProvider", () => ({}));
jest.mock("utils", () => ({
  ArrayUtils: {},
  log: { warn: jest.fn() },
  PromiseUtils: {},
}));
jest.mock("model", () => ({ RecordOrigin: {} }));

const surveyId = 1;
const recordUuids = ["record-1"];
const deleteFileMock = RecordFileService.deleteRecordFile as jest.Mock;
const fetchFileUuidsMock = RecordRepository.fetchRecordsFileUuids as jest.Mock;

describe("RecordService.deleteRecords", () => {
  beforeEach(() => jest.clearAllMocks());

  it("deletes the files no other record references", async () => {
    fetchFileUuidsMock
      .mockResolvedValueOnce(["file-1", "file-2"])
      .mockResolvedValueOnce(["file-2"]);

    await RecordService.deleteRecords({ surveyId, recordUuids });

    expect(RecordRepository.deleteRecords).toHaveBeenCalledWith({
      surveyId,
      recordUuids,
    });
    expect(deleteFileMock).toHaveBeenCalledTimes(1);
    expect(deleteFileMock).toHaveBeenCalledWith({
      surveyId,
      fileUuid: "file-1",
    });
  });

  it("goes on when a file cannot be deleted", async () => {
    fetchFileUuidsMock
      .mockResolvedValueOnce(["file-1", "file-2"])
      .mockResolvedValueOnce([]);
    deleteFileMock.mockRejectedValueOnce(new Error("missing"));

    await RecordService.deleteRecords({ surveyId, recordUuids });

    expect(deleteFileMock).toHaveBeenCalledTimes(2);
  });

  it("keeps the files if the records cannot be deleted", async () => {
    fetchFileUuidsMock.mockResolvedValueOnce(["file-1"]);
    (RecordRepository.deleteRecords as jest.Mock).mockRejectedValueOnce(
      new Error("db"),
    );

    await expect(
      RecordService.deleteRecords({ surveyId, recordUuids }),
    ).rejects.toThrow("db");
    expect(deleteFileMock).not.toHaveBeenCalled();
  });
});

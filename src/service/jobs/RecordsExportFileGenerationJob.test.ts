import { JobStatus, NodeDefType } from "@openforis/arena-core";

import { Files } from "utils";

import { RecordService } from "../record/recordService";
import { RecordsExportFileGenerationJob } from "./RecordsExportFileGenerationJob";

jest.mock("model", () => jest.requireActual("model/JobMobile"));
jest.mock("model/utils/RecordUtils", () => ({ RecordUtils: {} }));

jest.mock("utils/Logger");
// used by JobMobile for the temp folders
jest.mock("utils/Files", () => jest.requireMock("utils"));

jest.mock("utils", () => ({
  Files: {
    cacheDirectory: "cache",
    createTempFolder: jest.fn(async () => "temp"),
    copyFile: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(async () => true),
    getFreeDiskStorage: jest.fn(),
    mkDir: jest.fn(),
    path: (...parts: string[]) => parts.join("/"),
    toHumanReadableFileSize: (bytes: number) => `${bytes} B`,
    writeJsonToFile: jest.fn(),
    zip: jest.fn(),
  },
  SystemUtils: { getApplicationInfo: jest.fn(async () => ({})) },
}));

jest.mock("../record/recordService", () => ({
  RecordService: {
    fetchRecords: jest.fn(async () => [{ id: 1, uuid: "r1", cycle: "0" }]),
    fetchRecord: jest.fn(async () => ({ uuid: "r1", nodes: {} })),
    fetchRecordsFilesSize: jest.fn(async () => ({ r1: 1000 })),
  },
}));
jest.mock("../record/recordFileService", () => ({ RecordFileService: {} }));
jest.mock("../record/recordRemoteService", () => ({
  RecordRemoteService: { fetchFileUuidsByRecordUuid: jest.fn() },
}));

const MB = 1024 * 1024;

const survey = {
  id: 1,
  uuid: "s",
  props: { name: "s" },
  nodeDefs: { f: { uuid: "f", type: NodeDefType.file, props: {} } },
};

const createJob = () =>
  new RecordsExportFileGenerationJob({
    survey,
    cycle: "0",
    recordUuids: ["r1"],
    user: {},
  } as unknown as ConstructorParameters<
    typeof RecordsExportFileGenerationJob
  >[0]);

const getFreeDiskStorageMock = Files.getFreeDiskStorage as jest.Mock;

describe("RecordsExportFileGenerationJob", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fails without zipping when the free disk space is not enough", async () => {
    // files are copied and then zipped: twice their size is needed
    (RecordService.fetchRecordsFilesSize as jest.Mock).mockResolvedValueOnce({
      r1: 100 * MB,
    });
    getFreeDiskStorageMock.mockResolvedValueOnce(200 * MB);

    const job = createJob();
    await job.start();

    expect(job.status).toBe(JobStatus.failed);
    expect(job.errors).toEqual({
      "1": {
        error: {
          valid: false,
          errors: [
            {
              key: "appErrors:notEnoughDiskSpace",
              // 100 MB of files copied + zipped, plus a 50 MB margin
              params: { requiredSpace: `${50 * MB} B` },
            },
          ],
        },
      },
    });
    expect(Files.zip).not.toHaveBeenCalled();
  });

  it("generates the zip when the free disk space is enough", async () => {
    getFreeDiskStorageMock.mockResolvedValueOnce(1024 * MB);

    const job = createJob();
    await job.start();

    expect(job.status).toBe(JobStatus.succeeded);
    expect(Files.zip).toHaveBeenCalled();
  });
});

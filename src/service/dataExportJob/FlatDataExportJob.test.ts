import { JobStatus, Survey } from "@openforis/arena-core";

import { RecordService } from "service";
import { Files } from "utils";

import demoSurveyJson from "../demoSurvey.json";
import { FlatDataExportJob } from "./FlatDataExportJob";

jest.mock("model", () => jest.requireActual("model/JobMobile"));

jest.mock("utils/Logger", () => ({
  log: { debug: jest.fn(), error: jest.fn(), info: jest.fn() },
}));

jest.mock("service", () => ({
  RecordFileService: { getRecordFileUri: jest.fn() },
  RecordService: { fetchRecords: jest.fn(), fetchRecord: jest.fn() },
}));

jest.mock("utils", () => ({
  Files: {
    cacheDirectory: "cache",
    copyFile: jest.fn(),
    createTempFolder: jest.fn(async () => "temp"),
    del: jest.fn(),
    exists: jest.fn(async () => true),
    mkDir: jest.fn(),
    path: (...parts: string[]) => parts.join("/"),
    zip: jest.fn(),
  },
  FlatDataWriter: { appendCsvRows: jest.fn(), writeCsvHeaders: jest.fn() },
}));

const survey = JSON.parse(JSON.stringify(demoSurveyJson)) as Survey;

const createJob = () =>
  new FlatDataExportJob({
    user: {},
    survey,
    cycle: "0",
    options: {},
  } as any);

const fetchRecordsMock = RecordService.fetchRecords as jest.Mock;
const fetchRecordMock = RecordService.fetchRecord as jest.Mock;

const emptyRecord = { uuid: "record-uuid", nodes: {} };

describe("FlatDataExportJob", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchRecordsMock.mockResolvedValue([{ id: 1 }, { id: 2 }, { id: 3 }]);
  });

  it("exports every record and generates the output file", async () => {
    fetchRecordMock.mockResolvedValue(emptyRecord);
    const job = createJob();
    await job.start();

    expect(job.status).toBe(JobStatus.succeeded);
    expect(fetchRecordMock).toHaveBeenCalledTimes(3);
    expect(Files.zip).toHaveBeenCalledTimes(1);
  });

  it("stops exporting records when canceled", async () => {
    const job = createJob();
    let cancelPromise: Promise<void> | undefined;
    fetchRecordMock.mockImplementation(async () => {
      cancelPromise ??= job.cancel();
      return emptyRecord;
    });
    await job.start();
    await cancelPromise;

    expect(job.status).toBe(JobStatus.canceled);
    expect(fetchRecordMock).toHaveBeenCalledTimes(1);
    expect(Files.zip).not.toHaveBeenCalled();
  });
});

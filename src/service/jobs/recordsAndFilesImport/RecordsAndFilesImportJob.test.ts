import { ArenaSurvey, JobStatus } from "@openforis/arena-core";

import { Files } from "utils";

import { RecordsAndFilesImportJob } from "./RecordsAndFilesImportJob";

jest.mock("model", () => jest.requireActual("model/JobMobile"));

jest.mock("utils/Logger");
// used by JobMobile for the temp folder
jest.mock("utils/Files", () => jest.requireMock("utils"));

jest.mock("utils", () => ({
  Files: {
    createTempFolder: jest.fn(async () => "temp"),
    del: jest.fn(),
    unzip: jest.fn(),
  },
}));

// inner jobs doing nothing
jest.mock("./RecordsImportJob", () => {
  const { JobMobile } = jest.requireActual("model/JobMobile");
  return { RecordsImportJob: class extends JobMobile {} };
});
jest.mock("./FilesImportJob", () => {
  const { JobMobile } = jest.requireActual("model/JobMobile");
  return { FilesImportJob: class extends JobMobile {} };
});

const createJob = (fileUri?: string) =>
  new RecordsAndFilesImportJob({
    user: {},
    survey: {} as ArenaSurvey,
    fileUri,
  } as ConstructorParameters<typeof RecordsAndFilesImportJob>[0]);

describe("RecordsAndFilesImportJob", () => {
  it("unzips the file into a temp folder", async () => {
    const job = createJob("records.zip");
    await job.start();

    expect(job.status).toBe(JobStatus.succeeded);
    expect(Files.unzip).toHaveBeenCalledWith("records.zip", "temp", "UTF-8");
  });

  it("fails without unzipping when the file uri is missing", async () => {
    const job = createJob();
    await job.start();

    expect(job.status).toBe(JobStatus.failed);
    expect(Files.unzip).not.toHaveBeenCalled();
  });
});

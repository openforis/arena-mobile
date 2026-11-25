import { JobStatus } from "@openforis/arena-core";

import { dbClient } from "db";
import { Files } from "utils";

import { BackupJob } from "./BackupJob";

jest.mock("model", () => jest.requireActual("model/JobMobile"));

jest.mock("utils/Logger");
// used by JobMobile for the temp folders
jest.mock("utils/Files", () => jest.requireMock("utils"));

jest.mock("db", () => ({
  dbClient: {
    withConsistentDbFile: jest.fn(async (fn: () => Promise<void>) => fn()),
  },
}));

jest.mock("../offlineMaps/offlineMapTilesStorage", () => ({
  OfflineMapTilesStorage: { getTilesRootDirUri: () => "documents/tiles" },
}));
jest.mock("../importedMaps/importedMapsStorage", () => ({
  ImportedMapsStorage: { getRootDirUri: () => "documents/maps" },
}));

jest.mock("utils", () => ({
  Files: {
    cacheDirectory: "cache",
    documentDirectory: "documents",
    del: jest.fn(),
    exists: jest.fn(async () => false),
    moveFile: jest.fn(),
    path: (...parts: string[]) => parts.join("/"),
    zip: jest.fn(),
  },
}));

// null on web
const setDocumentDirectory = (documentDirectory: string | null) => {
  (Files as { documentDirectory: string | null }).documentDirectory =
    documentDirectory;
};

const createJob = () =>
  new BackupJob({ user: {} } as ConstructorParameters<typeof BackupJob>[0]);

describe("BackupJob", () => {
  afterEach(() => {
    setDocumentDirectory("documents");
  });

  it("zips the document directory", async () => {
    const job = createJob();
    await job.start();

    expect(job.status).toBe(JobStatus.succeeded);
    expect(Files.zip).toHaveBeenCalledWith(
      "documents",
      expect.stringMatching(/^cache\/arena_mobile_full_backup_.+\.zip$/),
    );
  });

  it("fails without zipping when the document directory is not available", async () => {
    setDocumentDirectory(null);
    const job = createJob();
    await job.start();

    expect(job.status).toBe(JobStatus.failed);
    expect(dbClient.withConsistentDbFile).not.toHaveBeenCalled();
    expect(Files.zip).not.toHaveBeenCalled();
  });
});

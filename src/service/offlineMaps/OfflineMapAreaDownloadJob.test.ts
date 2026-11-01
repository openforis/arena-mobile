import { MapLayers } from "model/MapLayers";
import { Files } from "utils/Files";
import { MapTileUtils } from "utils/MapTileUtils";

import { OfflineMapAreaDownloadJob } from "./OfflineMapAreaDownloadJob";
import { OfflineMapAreaRepository } from "./offlineMapAreaRepository";

jest.mock("utils/Logger", () => ({
  log: { debug: jest.fn(), error: jest.fn() },
}));

jest.mock("utils/Files", () => ({
  Files: {
    del: jest.fn(),
    download: jest.fn(),
    getSize: jest.fn(),
    mkDir: jest.fn(),
  },
}));

jest.mock("./mapTilesUserAgent", () => ({ mapTilesUserAgent: "test" }));

jest.mock("./offlineMapAreaRepository", () => ({
  OfflineMapAreaRepository: { saveArea: jest.fn() },
}));

jest.mock("./offlineMapTilesStorage", () => ({
  OfflineMapTilesStorage: {
    getTileDirUri: () => "dir",
    getTileFileUri: (_layerId: string, { x }: { x: number }) => `tile-${x}`,
  },
}));

const area = {
  coordinates: [],
  layerId: MapLayers.defaultLayerId,
  maxZoom: 1,
  minZoom: 1,
} as any;

const createJob = () =>
  new OfflineMapAreaDownloadJob({ user: {} as any, area });

describe("OfflineMapAreaDownloadJob", () => {
  beforeEach(() => {
    // the job throttles its progress events with timers
    jest.useFakeTimers();
    jest.clearAllMocks();
    jest
      .spyOn(MapTileUtils, "computeTilesForPolygon")
      .mockReturnValue([1, 2, 3].map((x) => ({ x, y: 0, z: 1 })));

    const fileSizes: Record<string, number> = { "tile-1": 100 };
    const remoteFileSizes: Record<string, number> = {
      "tile-2": 200,
      "tile-3": 300,
    };
    (Files.getSize as jest.Mock).mockImplementation(
      async (uri: string) => fileSizes[uri] ?? 0,
    );
    (Files.download as jest.Mock).mockImplementation(
      async (_url: string, uri: string) => {
        fileSizes[uri] = remoteFileSizes[uri]!;
        return { status: 200 };
      },
    );
  });

  afterEach(() => jest.useRealTimers());

  it("counts as transferred only the tiles not already on the device", async () => {
    const job = createJob();
    await job.execute();

    expect(job.toJSON().transferProcessedBytes).toBe(500);
  });

  it("adds up the size of the tiles downloaded concurrently", async () => {
    await createJob().execute();

    expect(OfflineMapAreaRepository.saveArea).toHaveBeenCalledWith(
      expect.objectContaining({ sizeBytes: 600 }),
    );
  });

  it("estimates the bytes left from the average size of the tiles", async () => {
    const job = createJob();
    await job.execute();
    job.total += 2;

    expect(job.toJSON().transferTotalBytes).toBe(500 + 2 * 200);
  });

  it("estimates the bytes left from the layer until a tile is available", () => {
    const job = createJob();
    job.total = 4;

    expect(job.toJSON().transferTotalBytes).toBe(
      4 * MapLayers.getLayer(area.layerId).averageTileSizeBytes,
    );
  });
});

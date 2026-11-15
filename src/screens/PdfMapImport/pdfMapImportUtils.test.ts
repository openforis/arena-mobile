import type { PdfMapPageCandidate, PdfMapPreview } from "service";

import {
  extractErrorDetails,
  getEstimateTextKey,
  getImportBlockingMessage,
  getImportMinZoom,
  isImportDisabled,
  toPageItems,
  toPreviewTileOverlays,
} from "./pdfMapImportUtils";

const createCandidate = (
  props: Partial<PdfMapPageCandidate> = {},
): PdfMapPageCandidate =>
  ({
    pageIndex: 0,
    georeference: {},
    zoomRange: { minZoom: 10, maxZoom: 16, nativeZoom: 16 },
    ...props,
  }) as PdfMapPageCandidate;

describe("extractErrorDetails", () => {
  it("returns the message of an Error", () => {
    expect(extractErrorDetails(new Error("failure"))).toBe("failure");
  });

  it("converts other values to string", () => {
    expect(extractErrorDetails("failure")).toBe("failure");
    expect(extractErrorDetails(null)).toBe("null");
    expect(extractErrorDetails(undefined)).toBe("undefined");
  });

  it("returns the details of the first error of a job summary", () => {
    expect(
      extractErrorDetails({
        errors: { a: { error: "first" }, b: { error: "second" } },
      }),
    ).toBe("first");
    expect(extractErrorDetails({ errors: { a: { key: "errorKey" } } })).toBe(
      "errorKey",
    );
    expect(extractErrorDetails({ errors: { a: { other: 1 } } })).toBe(
      '{"other":1}',
    );
  });

  it("falls back to the error itself when there are no job errors", () => {
    expect(extractErrorDetails({ errors: {} })).toBe("[object Object]");
    const error = Object.assign(new Error("failure"), { errors: null });
    expect(extractErrorDetails(error)).toBe("failure");
  });
});

describe("toPageItems", () => {
  it("uses the 1-based page number and the viewport name as label", () => {
    expect(
      toPageItems([
        createCandidate({ pageIndex: 0 }),
        createCandidate({ pageIndex: 2, viewportName: "Map" }),
      ]),
    ).toEqual([
      { value: "0", label: "1" },
      { value: "1", label: "3 - Map" },
    ]);
  });
});

describe("toPreviewTileOverlays", () => {
  it("returns undefined without preview", () => {
    expect(toPreviewTileOverlays(null)).toBeUndefined();
  });

  it("returns a single overlay with the preview tiles", () => {
    const preview: PdfMapPreview = {
      id: "p1",
      tilesPath: "/tmp/p1",
      minZoom: 10,
      maxZoom: 13,
    };
    expect(toPreviewTileOverlays(preview)).toEqual([
      { key: "p1", tilesPath: "/tmp/p1", minZoom: 10, maxZoom: 13 },
    ]);
  });
});

describe("getImportMinZoom", () => {
  it("is the min zoom of the page, or the max zoom if lower", () => {
    const candidate = createCandidate();
    expect(getImportMinZoom({ candidate, maxZoom: 14 })).toBe(10);
    expect(getImportMinZoom({ candidate, maxZoom: 8 })).toBe(8);
  });
});

describe("getImportBlockingMessage", () => {
  const params = {
    nameErrorKey: null,
    exceedsMaxTiles: false,
    exceedsFreeSpace: false,
    maxTiles: 100,
  };

  it("returns null when the import can start", () => {
    expect(getImportBlockingMessage(params)).toBeNull();
  });

  it("checks the name first, then the tiles, then the free space", () => {
    expect(
      getImportBlockingMessage({
        ...params,
        nameErrorKey: "pdfMaps:validation.nameRequired",
        exceedsMaxTiles: true,
        exceedsFreeSpace: true,
      }),
    ).toEqual({ key: "pdfMaps:validation.nameRequired" });
    expect(
      getImportBlockingMessage({
        ...params,
        exceedsMaxTiles: true,
        exceedsFreeSpace: true,
      }),
    ).toEqual({
      key: "pdfMaps:import.tooManyTiles",
      params: { maxTiles: 100 },
    });
    expect(
      getImportBlockingMessage({ ...params, exceedsFreeSpace: true }),
    ).toEqual({ key: "pdfMaps:import.notEnoughSpace" });
  });
});

describe("isImportDisabled", () => {
  it("is disabled while importing or when the map cannot be imported", () => {
    const params = {
      importing: false,
      exceedsMaxTiles: false,
      exceedsFreeSpace: false,
    };
    expect(isImportDisabled(params)).toBe(false);
    expect(isImportDisabled({ ...params, importing: true })).toBe(true);
    expect(isImportDisabled({ ...params, exceedsMaxTiles: true })).toBe(true);
    expect(isImportDisabled({ ...params, exceedsFreeSpace: true })).toBe(true);
  });
});

describe("getEstimateTextKey", () => {
  it("uses a different message when there are too many tiles", () => {
    expect(getEstimateTextKey(false)).toBe("pdfMaps:import.estimate");
    expect(getEstimateTextKey(true)).toBe(
      "pdfMaps:import.estimateTooManyTiles",
    );
  });
});

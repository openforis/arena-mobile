import type {
  ImportedMapFileAnalysis,
  ImportedMapPageCandidate,
  ImportedMapPreview,
} from "service";

import {
  createInitialImportState,
  getAnalysisErrorKey,
  initialPreviewState,
  mapImportReducer,
  importedMapPreviewReducer,
  MapImportState,
} from "./mapImportState";

// the real service pulls in the native PDF renderer and the file system
jest.mock("service", () => ({
  ImportedMapsService: {
    generateDefaultName: ({
      fileName,
      candidate,
      candidatesCount,
    }: {
      fileName: string;
      candidate: { pageIndex: number };
      candidatesCount: number;
    }) => `${fileName} ${candidate.pageIndex + 1}/${candidatesCount}`,
  },
}));

const createCandidate = (
  pageIndex: number,
  maxZoom: number,
): ImportedMapPageCandidate =>
  ({
    pageIndex,
    georeference: {},
    zoomRange: { minZoom: 10, maxZoom, nativeZoom: maxZoom },
  }) as ImportedMapPageCandidate;

const createAnalysis = (
  candidates: ImportedMapPageCandidate[],
  hasUnsupportedGeoreference = false,
): ImportedMapFileAnalysis => ({
  sourceType: "pdf",
  info: {
    pagesCount: candidates.length,
    pages: [],
    hasUnsupportedGeoreference,
  },
  candidates,
});

const twoPagesAnalysis = createAnalysis([
  createCandidate(0, 16),
  createCandidate(1, 18),
]);

const analyzedState = (analysis: ImportedMapFileAnalysis): MapImportState =>
  mapImportReducer(createInitialImportState("map.pdf"), {
    type: "analysisCompleted",
    analysis,
    freeDiskStorage: 1000,
  });

describe("getAnalysisErrorKey", () => {
  it("returns no error when there are georeferenced pages", () => {
    expect(getAnalysisErrorKey(twoPagesAnalysis)).toBeUndefined();
  });

  it("distinguishes unsupported georeferencing from missing one", () => {
    expect(getAnalysisErrorKey(createAnalysis([]))).toBe(
      "importedMaps:import.notGeoreferenced",
    );
    expect(getAnalysisErrorKey(createAnalysis([], true))).toBe(
      "importedMaps:import.unsupportedGeoreference",
    );
  });

  it("reports files that are neither PDF nor TIFF", () => {
    expect(getAnalysisErrorKey({ sourceType: null, candidates: [] })).toBe(
      "importedMaps:import.unsupportedFile",
    );
  });

  it("reports GeoTIFF files whose pixels cannot be read", () => {
    const analysis: ImportedMapFileAnalysis = {
      sourceType: "geotiff",
      candidates: [],
      unsupportedFormat: "16 bits per sample",
    };
    expect(getAnalysisErrorKey(analysis)).toBe(
      "importedMaps:import.unsupportedGeoTiffFormat",
    );
    expect(analyzedState(analysis).errorParams).toEqual({
      details: "16 bits per sample",
    });
  });
});

describe("mapImportReducer", () => {
  it("starts loading", () => {
    expect(createInitialImportState("map.pdf")).toEqual({
      fileName: "map.pdf",
      loading: true,
      analysis: null,
      freeDiskStorage: null,
      candidateIndex: 0,
      name: "",
      maxZoom: 0,
    });
  });

  it("selects the first page with its defaults when the analysis completes", () => {
    const state = analyzedState(twoPagesAnalysis);
    expect(state).toMatchObject({
      loading: false,
      analysis: twoPagesAnalysis,
      freeDiskStorage: 1000,
      candidateIndex: 0,
      name: "map.pdf 1/2",
      maxZoom: 16,
    });
    expect(state.errorKey).toBeUndefined();
  });

  it("sets the error key when no page is georeferenced", () => {
    const state = analyzedState(createAnalysis([]));
    expect(state).toMatchObject({
      loading: false,
      errorKey: "importedMaps:import.notGeoreferenced",
      name: "",
      maxZoom: 0,
    });
  });

  it("stores the error of a failed analysis", () => {
    const state = mapImportReducer(createInitialImportState("map.pdf"), {
      type: "analysisFailed",
      errorKey: "importedMaps:import.errorReading",
      errorParams: { details: "failure" },
    });
    expect(state).toMatchObject({
      loading: false,
      analysis: null,
      errorKey: "importedMaps:import.errorReading",
      errorParams: { details: "failure" },
    });
  });

  it("resets name and max zoom when another page is selected", () => {
    const edited = mapImportReducer(
      mapImportReducer(analyzedState(twoPagesAnalysis), {
        type: "nameChanged",
        name: "custom",
      }),
      { type: "maxZoomChanged", maxZoom: 12 },
    );
    expect(edited).toMatchObject({ name: "custom", maxZoom: 12 });

    const otherPage = mapImportReducer(edited, {
      type: "pageSelected",
      candidateIndex: 1,
    });
    expect(otherPage).toMatchObject({
      candidateIndex: 1,
      name: "map.pdf 2/2",
      maxZoom: 18,
    });
  });

  it("keeps the edited values when the same page is selected again", () => {
    const edited = mapImportReducer(analyzedState(twoPagesAnalysis), {
      type: "nameChanged",
      name: "custom",
    });
    expect(
      mapImportReducer(edited, { type: "pageSelected", candidateIndex: 0 }),
    ).toBe(edited);
  });
});

describe("importedMapPreviewReducer", () => {
  const preview: ImportedMapPreview = {
    id: "p1",
    tilesPath: "/tmp/p1",
    minZoom: 10,
    maxZoom: 13,
  };

  it("clears the previous preview and error when rendering starts", () => {
    const state = importedMapPreviewReducer(
      { preview, loading: false, errorDetails: "failure" },
      { type: "previewStarted" },
    );
    expect(state).toEqual({ preview: null, loading: true, errorDetails: null });
  });

  it("stores the rendered preview", () => {
    const started = importedMapPreviewReducer(initialPreviewState, {
      type: "previewStarted",
    });
    expect(
      importedMapPreviewReducer(started, { type: "previewRendered", preview }),
    ).toEqual({ preview, loading: false, errorDetails: null });
  });

  it("stores the error details", () => {
    const started = importedMapPreviewReducer(initialPreviewState, {
      type: "previewStarted",
    });
    expect(
      importedMapPreviewReducer(started, {
        type: "previewFailed",
        errorDetails: "failure",
      }),
    ).toEqual({ preview: null, loading: false, errorDetails: "failure" });
  });
});

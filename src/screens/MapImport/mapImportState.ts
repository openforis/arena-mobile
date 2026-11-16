import { ImportedMapsService } from "service";
import type {
  ImportedMapFileAnalysis,
  ImportedMapPageCandidate,
  ImportedMapPreview,
} from "service";

// file analysis and import options of the selected page
export type MapImportState = {
  fileName: string;
  loading: boolean;
  analysis: ImportedMapFileAnalysis | null;
  freeDiskStorage: number | null;
  errorKey?: string;
  errorParams?: Record<string, string>;
  candidateIndex: number;
  name: string;
  maxZoom: number;
};

export type MapImportAction =
  | {
      type: "analysisCompleted";
      analysis: ImportedMapFileAnalysis;
      freeDiskStorage: number;
    }
  | {
      type: "analysisFailed";
      errorKey?: string;
      errorParams?: Record<string, string>;
    }
  | { type: "pageSelected"; candidateIndex: number }
  | { type: "nameChanged"; name: string }
  | { type: "maxZoomChanged"; maxZoom: number };

export const createInitialImportState = (fileName: string): MapImportState => ({
  fileName,
  loading: true,
  analysis: null,
  freeDiskStorage: null,
  candidateIndex: 0,
  name: "",
  maxZoom: 0,
});

export const getAnalysisErrorKey = (
  analysis: ImportedMapFileAnalysis,
): string | undefined => {
  if (analysis.candidates.length > 0) return undefined;
  return analysis.info.hasUnsupportedGeoreference
    ? "importedMaps:import.unsupportedGeoreference"
    : "importedMaps:import.notGeoreferenced";
};

// default name and max zoom of the selected page
const selectCandidate = (
  state: MapImportState,
  candidateIndex: number,
): MapImportState => {
  const candidates = state.analysis?.candidates ?? [];
  const candidate: ImportedMapPageCandidate | undefined =
    candidates[candidateIndex];
  if (!candidate) return { ...state, candidateIndex };
  return {
    ...state,
    candidateIndex,
    name: ImportedMapsService.generateDefaultName({
      fileName: state.fileName,
      candidate,
      candidatesCount: candidates.length,
    }),
    maxZoom: candidate.zoomRange.maxZoom,
  };
};

export const mapImportReducer = (
  state: MapImportState,
  action: MapImportAction,
): MapImportState => {
  switch (action.type) {
    case "analysisCompleted": {
      const { analysis, freeDiskStorage } = action;
      const stateNext: MapImportState = {
        ...state,
        loading: false,
        analysis,
        freeDiskStorage,
        errorKey: getAnalysisErrorKey(analysis),
        errorParams: undefined,
      };
      return selectCandidate(stateNext, state.candidateIndex);
    }
    case "analysisFailed":
      return {
        ...state,
        loading: false,
        analysis: null,
        errorKey: action.errorKey,
        errorParams: action.errorParams,
      };
    case "pageSelected":
      if (action.candidateIndex === state.candidateIndex) return state;
      return selectCandidate(state, action.candidateIndex);
    case "nameChanged":
      return { ...state, name: action.name };
    case "maxZoomChanged":
      return { ...state, maxZoom: action.maxZoom };
    default:
      return state;
  }
};

// low resolution preview of the selected page
export type ImportedMapPreviewState = {
  preview: ImportedMapPreview | null;
  loading: boolean;
  errorDetails: string | null;
};

export type ImportedMapPreviewAction =
  | { type: "previewStarted" }
  | { type: "previewRendered"; preview: ImportedMapPreview | null }
  | { type: "previewFailed"; errorDetails: string };

export const initialPreviewState: ImportedMapPreviewState = {
  preview: null,
  loading: false,
  errorDetails: null,
};

export const importedMapPreviewReducer = (
  state: ImportedMapPreviewState,
  action: ImportedMapPreviewAction,
): ImportedMapPreviewState => {
  switch (action.type) {
    case "previewStarted":
      return { preview: null, loading: true, errorDetails: null };
    case "previewRendered":
      return { ...state, preview: action.preview, loading: false };
    case "previewFailed":
      return { ...state, errorDetails: action.errorDetails, loading: false };
    default:
      return state;
  }
};

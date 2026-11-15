import { PdfMapsService } from "service";
import type {
  PdfMapFileAnalysis,
  PdfMapPageCandidate,
  PdfMapPreview,
} from "service";

// file analysis and import options of the selected page
export type PdfMapImportState = {
  fileName: string;
  loading: boolean;
  analysis: PdfMapFileAnalysis | null;
  freeDiskStorage: number | null;
  errorKey?: string;
  errorParams?: Record<string, string>;
  candidateIndex: number;
  name: string;
  maxZoom: number;
};

export type PdfMapImportAction =
  | {
      type: "analysisCompleted";
      analysis: PdfMapFileAnalysis;
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

export const createInitialImportState = (
  fileName: string,
): PdfMapImportState => ({
  fileName,
  loading: true,
  analysis: null,
  freeDiskStorage: null,
  candidateIndex: 0,
  name: "",
  maxZoom: 0,
});

export const getAnalysisErrorKey = (
  analysis: PdfMapFileAnalysis,
): string | undefined => {
  if (analysis.candidates.length > 0) return undefined;
  return analysis.info.hasUnsupportedGeoreference
    ? "pdfMaps:import.unsupportedGeoreference"
    : "pdfMaps:import.notGeoreferenced";
};

// default name and max zoom of the selected page
const selectCandidate = (
  state: PdfMapImportState,
  candidateIndex: number,
): PdfMapImportState => {
  const candidates = state.analysis?.candidates ?? [];
  const candidate: PdfMapPageCandidate | undefined = candidates[candidateIndex];
  if (!candidate) return { ...state, candidateIndex };
  return {
    ...state,
    candidateIndex,
    name: PdfMapsService.generateDefaultName({
      fileName: state.fileName,
      candidate,
      candidatesCount: candidates.length,
    }),
    maxZoom: candidate.zoomRange.maxZoom,
  };
};

export const pdfMapImportReducer = (
  state: PdfMapImportState,
  action: PdfMapImportAction,
): PdfMapImportState => {
  switch (action.type) {
    case "analysisCompleted": {
      const { analysis, freeDiskStorage } = action;
      const stateNext: PdfMapImportState = {
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
export type PdfMapPreviewState = {
  preview: PdfMapPreview | null;
  loading: boolean;
  errorDetails: string | null;
};

export type PdfMapPreviewAction =
  | { type: "previewStarted" }
  | { type: "previewRendered"; preview: PdfMapPreview | null }
  | { type: "previewFailed"; errorDetails: string };

export const initialPreviewState: PdfMapPreviewState = {
  preview: null,
  loading: false,
  errorDetails: null,
};

export const pdfMapPreviewReducer = (
  state: PdfMapPreviewState,
  action: PdfMapPreviewAction,
): PdfMapPreviewState => {
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

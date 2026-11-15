import { useCallback, useEffect, useMemo, useReducer, useState } from "react";

import { useNavigator, useScreenParams } from "navigation/navigator";
import { screenKeys } from "screens/screenKeys";
import { useToast } from "hooks";
import { JobCancelError } from "model";
import { PdfMapsService } from "service";
import type { PdfMapImportJobResult } from "service";
import {
  JobMonitorActions,
  SettingsActions,
  SettingsSelectors,
  useAppDispatch,
} from "state";
import { Files, GeoUtils, log } from "utils";

import { useStorageEstimateCheck } from "../OfflineMaps/useStorageEstimateCheck";
import {
  createInitialImportState,
  initialPreviewState,
  pdfMapImportReducer,
  pdfMapPreviewReducer,
} from "./pdfMapImportState";
import {
  extractErrorDetails,
  getImportBlockingMessage,
  getImportMinZoom,
  isImportDisabled,
  toPageItems,
  toPreviewTileOverlays,
} from "./pdfMapImportUtils";

export const usePdfMapImport = () => {
  const navigator = useNavigator();
  const { fileUri, fileName = "" } = useScreenParams<screenKeys.pdfMapImport>();
  const dispatch = useAppDispatch();
  const toaster = useToast();
  const settings = SettingsSelectors.useSettings();
  const pdfMaps = settings.pdfMaps;

  const [importState, dispatchImport] = useReducer(
    pdfMapImportReducer,
    fileName,
    createInitialImportState,
  );
  const {
    loading,
    analysis,
    freeDiskStorage,
    errorKey,
    errorParams,
    candidateIndex,
    name,
    maxZoom,
  } = importState;
  const [previewState, dispatchPreview] = useReducer(
    pdfMapPreviewReducer,
    initialPreviewState,
  );
  const { preview } = previewState;
  const [importing, setImporting] = useState(false);
  const [baseMapHidden, setBaseMapHidden] = useState(false);
  const [currentZoom, setCurrentZoom] = useState<number | null>(null);

  const candidates = useMemo(() => analysis?.candidates ?? [], [analysis]);
  const candidate = candidates[candidateIndex];

  // 1. read the georeferencing of the pages of the file
  useEffect(() => {
    const analyze = async () => {
      if (!fileUri) {
        dispatchImport({ type: "analysisFailed" });
        return;
      }
      try {
        const [analysisResult, freeSpace] = await Promise.all([
          PdfMapsService.analyzeFile(fileUri),
          Files.getFreeDiskStorage(),
        ]);
        dispatchImport({
          type: "analysisCompleted",
          analysis: analysisResult,
          freeDiskStorage: freeSpace,
        });
      } catch (error) {
        log.error("error reading PDF file", error);
        dispatchImport({
          type: "analysisFailed",
          errorKey: "pdfMaps:import.errorReading",
          errorParams: { details: extractErrorDetails(error) },
        });
      }
    };
    void analyze();
  }, [fileUri]);

  // the file picker copied the file into the cache folder: the import job makes its own copy
  useEffect(
    () => () => {
      if (fileUri?.startsWith(Files.cacheDirectory)) {
        void Files.del(fileUri, true);
      }
    },
    [fileUri],
  );

  // 2. low resolution preview of the selected page, rendered as it will be imported
  useEffect(() => {
    if (!candidate || !fileUri || !PdfMapsService.isRendererAvailable()) return;
    let stopped = false;
    const renderPreview = async () => {
      dispatchPreview({ type: "previewStarted" });
      try {
        const previewRendered = await PdfMapsService.renderPreview({
          sourceFileUri: fileUri,
          candidate,
          shouldStop: () => stopped,
        });
        if (!stopped)
          dispatchPreview({
            type: "previewRendered",
            preview: previewRendered,
          });
      } catch (error) {
        log.error("error rendering PDF map preview", error);
        if (!stopped)
          dispatchPreview({
            type: "previewFailed",
            errorDetails: extractErrorDetails(error),
          });
      }
    };
    void renderPreview();
    return () => {
      stopped = true;
    };
  }, [candidate, fileUri]);

  useEffect(
    () => () => {
      void PdfMapsService.deleteAllPreviews();
    },
    [],
  );

  const previewTileOverlays = useMemo(
    () => toPreviewTileOverlays(preview),
    [preview],
  );

  const pageItems = useMemo(() => toPageItems(candidates), [candidates]);

  const selectableZoomRange = candidate
    ? PdfMapsService.getSelectableMaxZoomRange(candidate.zoomRange)
    : null;

  // 3. size of the map with the selected options
  const estimate = useMemo(
    () =>
      candidate
        ? PdfMapsService.estimate({
            georeference: candidate.georeference,
            minZoom: getImportMinZoom({ candidate, maxZoom }),
            maxZoom,
          })
        : null,
    [candidate, maxZoom],
  );

  const nameErrorKey = PdfMapsService.validateName({
    name,
    pdfMaps: pdfMaps ?? [],
  });
  const { confirmLowSpace, exceedsFreeSpace, freeSpaceText } =
    useStorageEstimateCheck({
      estimatedSizeBytes: estimate?.estimatedSizeBytes,
      freeDiskStorage,
    });

  const neatline = candidate?.georeference.neatline;
  const initialRegion = useMemo(
    () =>
      neatline
        ? GeoUtils.computeRegionFromCoordinates(neatline)
        : GeoUtils.defaultMapRegion,
    [neatline],
  );

  const onPageChange = useCallback((value: string) => {
    dispatchImport({ type: "pageSelected", candidateIndex: Number(value) });
  }, []);

  const onNameChange = useCallback((value: string) => {
    dispatchImport({ type: "nameChanged", name: value });
  }, []);

  const onMaxZoomChange = useCallback((value: number) => {
    dispatchImport({ type: "maxZoomChanged", maxZoom: value });
  }, []);

  // tiles of the integer zoom level are shown until the next level is reached
  const onZoomChange = useCallback((zoom: number) => {
    setCurrentZoom(Math.floor(zoom));
  }, []);

  const onGoBack = useCallback(() => navigator.goBack(), [navigator]);

  // 4. checks, then the import job
  const onImportPress = useCallback(async () => {
    if (!candidate || !estimate || !fileUri) return;
    const blockingMessage = getImportBlockingMessage({
      nameErrorKey,
      exceedsMaxTiles: estimate.exceedsMaxTiles,
      exceedsFreeSpace,
      maxTiles: PdfMapsService.MAX_TILES_PER_MAP,
    });
    if (blockingMessage) {
      toaster(blockingMessage.key, blockingMessage.params);
      return;
    }
    if (
      !(await confirmLowSpace({
        titleKey: "pdfMaps:import.lowSpaceConfirm.title",
        messageKey: "pdfMaps:import.lowSpaceConfirm.message",
        confirmButtonTextKey: "pdfMaps:import.importButton",
      }))
    ) {
      return;
    }
    setImporting(true);
    const job = PdfMapsService.createImportJob({
      sourceFileUri: fileUri,
      fileName,
      name,
      candidate,
      maxZoom,
    });
    try {
      const jobComplete =
        await JobMonitorActions.startAsync<PdfMapImportJobResult>({
          dispatch,
          job,
          titleKey: "pdfMaps:import.jobTitle",
          autoDismiss: true,
        });
      const pdfMap = jobComplete?.result?.pdfMap;
      // the map has been stored in the settings by the job
      await dispatch(SettingsActions.initSettings());
      toaster("pdfMaps:import.complete", {
        size: Files.toHumanReadableFileSize(pdfMap?.sizeBytes ?? 0),
      });
      navigator.goBack();
    } catch (error) {
      if (!(error instanceof JobCancelError)) {
        log.error("PDF map import failed", error);
        toaster("pdfMaps:import.error", {
          details: extractErrorDetails(error),
        });
      }
    } finally {
      setImporting(false);
    }
  }, [
    candidate,
    confirmLowSpace,
    dispatch,
    estimate,
    exceedsFreeSpace,
    fileName,
    fileUri,
    maxZoom,
    name,
    nameErrorKey,
    navigator,
    toaster,
  ]);

  const importDisabled =
    !estimate ||
    isImportDisabled({
      importing,
      exceedsMaxTiles: estimate.exceedsMaxTiles,
      exceedsFreeSpace,
    });

  return {
    loading,
    errorKey,
    errorParams,
    candidates,
    candidate,
    candidateIndex,
    pageItems,
    name,
    nameErrorKey,
    maxZoom,
    selectableZoomRange,
    estimate,
    exceedsFreeSpace,
    freeSpaceText,
    previewState,
    previewTileOverlays,
    neatline,
    initialRegion,
    baseMapHidden,
    currentZoom,
    importing,
    importDisabled,
    onPageChange,
    onNameChange,
    onMaxZoomChange,
    onZoomChange,
    setBaseMapHidden,
    onGoBack,
    onImportPress,
  };
};

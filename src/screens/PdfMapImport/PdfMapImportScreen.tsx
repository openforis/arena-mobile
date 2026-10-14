import { useCallback, useEffect, useMemo, useState } from "react";
import { Polygon } from "react-native-maps";
import { useNavigation, useRoute } from "@react-navigation/native";

import {
  Button,
  Dropdown,
  HView,
  LoadingIcon,
  MapTileOverlay,
  MapView,
  Slider,
  Switch,
  Text,
  TextInput,
  VView,
} from "components";
import { useToast } from "hooks";
import { JobCancelError, PdfMap } from "model";
import { PdfMapFileAnalysis, PdfMapPreview, PdfMapsService } from "service";
import {
  JobMonitorActions,
  SettingsActions,
  SettingsSelectors,
  useAppDispatch,
  useConfirm,
} from "state";
import { Files, GeoUtils, log } from "utils";

import styles from "./styles";

const neatlineStrokeColor = "rgba(21, 101, 192, 0.95)";
const neatlineFillColor = "rgba(21, 101, 192, 0.15)";
// ratio of the free space above which the user is asked to confirm the import
const FREE_SPACE_WARNING_RATIO = 0.8;

export type PdfMapImportParams = { fileUri: string; fileName: string };

type AnalysisState = {
  loading: boolean;
  analysis: PdfMapFileAnalysis | null;
  errorKey?: string;
  errorParams?: Record<string, string>;
};

const extractErrorDetails = (error: any): string => {
  const errors = error?.errors;
  if (errors && typeof errors === "object") {
    const firstError: any = Object.values(errors)[0];
    if (firstError)
      return String(
        firstError?.error ?? firstError?.key ?? JSON.stringify(firstError),
      );
  }
  return error instanceof Error ? error.message : String(error);
};

export const PdfMapImportScreen = () => {
  log.debug("rendering PdfMapImportScreen");

  const navigation = useNavigation();
  const route = useRoute();
  const { fileUri, fileName = "" } = (route.params ??
    {}) as Partial<PdfMapImportParams>;
  const dispatch = useAppDispatch();
  const confirm = useConfirm();
  const toaster = useToast();
  const settings = SettingsSelectors.useSettings();
  const pdfMaps = settings.pdfMaps;

  const [{ loading, analysis, errorKey, errorParams }, setAnalysisState] =
    useState<AnalysisState>({ loading: true, analysis: null });
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [name, setName] = useState("");
  const [maxZoom, setMaxZoom] = useState(0);
  const [freeDiskStorage, setFreeDiskStorage] = useState<number | null>(null);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState<PdfMapPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewErrorDetails, setPreviewErrorDetails] = useState<string | null>(
    null,
  );
  const [baseMapHidden, setBaseMapHidden] = useState(false);

  const candidates = useMemo(() => analysis?.candidates ?? [], [analysis]);
  const candidate = candidates[candidateIndex];

  useEffect(() => {
    const analyze = async () => {
      if (!fileUri) {
        setAnalysisState({ loading: false, analysis: null });
        return;
      }
      try {
        const [analysisResult, freeSpace] = await Promise.all([
          PdfMapsService.analyzeFile(fileUri),
          Files.getFreeDiskStorage(),
        ]);
        setFreeDiskStorage(freeSpace);
        const { info, candidates: candidatesFound } = analysisResult;
        if (candidatesFound.length === 0) {
          setAnalysisState({
            loading: false,
            analysis: analysisResult,
            errorKey: info.hasUnsupportedGeoreference
              ? "pdfMaps:import.unsupportedGeoreference"
              : "pdfMaps:import.notGeoreferenced",
          });
          return;
        }
        setAnalysisState({ loading: false, analysis: analysisResult });
      } catch (error) {
        log.error("error reading PDF file", error);
        setAnalysisState({
          loading: false,
          analysis: null,
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

  // low resolution preview of the selected page, rendered as it will be imported
  useEffect(() => {
    if (!candidate || !fileUri || !PdfMapsService.isRendererAvailable()) return;
    let stopped = false;
    const renderPreview = async () => {
      setPreview(null);
      setPreviewErrorDetails(null);
      setPreviewLoading(true);
      try {
        const previewRendered = await PdfMapsService.renderPreview({
          sourceFileUri: fileUri,
          candidate,
          shouldStop: () => stopped,
        });
        if (!stopped) setPreview(previewRendered);
      } catch (error) {
        log.error("error rendering PDF map preview", error);
        if (!stopped) setPreviewErrorDetails(extractErrorDetails(error));
      } finally {
        if (!stopped) setPreviewLoading(false);
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

  const previewTileOverlays = useMemo<MapTileOverlay[] | undefined>(
    () =>
      preview
        ? [
            {
              key: preview.id,
              tilesPath: preview.tilesPath,
              minZoom: preview.minZoom,
              maxZoom: preview.maxZoom,
            },
          ]
        : undefined,
    [preview],
  );

  // default name and max zoom when the selected page changes
  useEffect(() => {
    if (!candidate) return;
    setName(
      PdfMapsService.generateDefaultName({
        fileName,
        candidate,
        candidatesCount: candidates.length,
      }),
    );
    setMaxZoom(candidate.zoomRange.maxZoom);
  }, [candidate, candidates.length, fileName]);

  const pageItems = useMemo(
    () =>
      candidates.map((item, index) => ({
        value: String(index),
        label: item.viewportName
          ? `${item.pageIndex + 1} - ${item.viewportName}`
          : String(item.pageIndex + 1),
      })),
    [candidates],
  );

  const selectableZoomRange = candidate
    ? PdfMapsService.getSelectableMaxZoomRange(candidate.zoomRange)
    : null;

  const estimate = useMemo(
    () =>
      candidate
        ? PdfMapsService.estimate({
            georeference: candidate.georeference,
            minZoom: Math.min(candidate.zoomRange.minZoom, maxZoom),
            maxZoom,
          })
        : null,
    [candidate, maxZoom],
  );

  const nameErrorKey = PdfMapsService.validateName({
    name,
    pdfMaps: pdfMaps ?? [],
  });
  const exceedsFreeSpace =
    !!estimate &&
    freeDiskStorage !== null &&
    estimate.estimatedSizeBytes > freeDiskStorage;
  const freeSpaceUsageRatio =
    estimate && freeDiskStorage
      ? estimate.estimatedSizeBytes / freeDiskStorage
      : null;

  const neatline = candidate?.georeference.neatline;
  const initialRegion = useMemo(
    () =>
      neatline
        ? GeoUtils.computeRegionFromCoordinates(neatline)
        : GeoUtils.defaultMapRegion,
    [neatline],
  );

  const onPageChange = useCallback((value: string) => {
    setCandidateIndex(Number(value));
  }, []);

  const onImportPress = useCallback(async () => {
    if (!candidate || !estimate || !fileUri) return;
    if (nameErrorKey) {
      toaster(nameErrorKey);
      return;
    }
    if (estimate.exceedsMaxTiles) {
      toaster("pdfMaps:import.tooManyTiles", {
        maxTiles: PdfMapsService.MAX_TILES_PER_MAP,
      });
      return;
    }
    if (exceedsFreeSpace) {
      toaster("pdfMaps:import.notEnoughSpace");
      return;
    }
    if (
      (freeSpaceUsageRatio ?? 0) >= FREE_SPACE_WARNING_RATIO &&
      !(await confirm({
        titleKey: "pdfMaps:import.lowSpaceConfirm.title",
        messageKey: "pdfMaps:import.lowSpaceConfirm.message",
        messageParams: {
          size: Files.toHumanReadableFileSize(estimate.estimatedSizeBytes),
          freeSpace: Files.toHumanReadableFileSize(freeDiskStorage ?? 0),
          percent: Math.floor((freeSpaceUsageRatio ?? 0) * 100),
        },
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
      const jobComplete = await JobMonitorActions.startAsync({
        dispatch,
        job,
        titleKey: "pdfMaps:import.jobTitle",
        autoDismiss: true,
      });
      const pdfMap: PdfMap | undefined = (jobComplete as any)?.result?.pdfMap;
      // the map has been stored in the settings by the job
      await dispatch(SettingsActions.initSettings());
      toaster("pdfMaps:import.complete", {
        size: Files.toHumanReadableFileSize(pdfMap?.sizeBytes ?? 0),
      });
      navigation.goBack();
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
    confirm,
    dispatch,
    estimate,
    exceedsFreeSpace,
    fileName,
    fileUri,
    freeDiskStorage,
    freeSpaceUsageRatio,
    maxZoom,
    name,
    nameErrorKey,
    navigation,
    toaster,
  ]);

  if (loading) {
    return (
      <VView style={styles.messageContainer}>
        <LoadingIcon />
        <Text style={styles.messageText} textKey="pdfMaps:import.analyzing" />
      </VView>
    );
  }

  if (!candidate || !estimate || !selectableZoomRange) {
    return (
      <VView style={styles.messageContainer}>
        <Text
          style={[styles.messageText, styles.errorText]}
          textKey={errorKey ?? "pdfMaps:import.notGeoreferenced"}
          textParams={errorParams}
        />
        <Button
          icon="arrow-left"
          onPress={() => navigation.goBack()}
          textKey="common:goBack"
        />
      </VView>
    );
  }

  return (
    <VView style={styles.container}>
      <VView style={styles.header}>
        <TextInput
          error={!!nameErrorKey}
          label="pdfMaps:import.name"
          onChange={setName}
          value={name}
        />
        {nameErrorKey && (
          <Text style={styles.errorText} textKey={nameErrorKey} />
        )}
        {candidates.length > 1 && (
          <Dropdown
            items={pageItems}
            label="pdfMaps:import.page"
            onChange={onPageChange}
            translateItemLabels={false}
            value={String(candidateIndex)}
          />
        )}
        {!candidate.georeference.datumCompatible && (
          <Text style={styles.warningText} textKey="pdfMaps:map.datumWarning" />
        )}
        <HView style={styles.zoomRow}>
          <Text
            style={styles.zoomLabel}
            textKey="pdfMaps:import.maxZoom"
            textParams={{ value: maxZoom }}
          />
          <VView style={styles.zoomSlider}>
            <Slider
              minValue={selectableZoomRange.min}
              maxValue={selectableZoomRange.max}
              step={1}
              value={maxZoom}
              onValueChange={setMaxZoom}
            />
          </VView>
          <Text
            style={styles.zoomLabel}
            textKey="pdfMaps:import.nativeZoom"
            textParams={{ value: candidate.zoomRange.nativeZoom }}
            variant="bodySmall"
          />
        </HView>
        {maxZoom > candidate.zoomRange.nativeZoom && (
          <Text
            style={styles.warningText}
            textKey="pdfMaps:import.maxZoomAboveNative"
          />
        )}
        <Text
          style={[
            styles.estimateText,
            (estimate.exceedsMaxTiles || exceedsFreeSpace) && styles.errorText,
          ]}
          textKey={
            estimate.exceedsMaxTiles
              ? "pdfMaps:import.estimateTooManyTiles"
              : "pdfMaps:import.estimate"
          }
          textParams={{
            tiles: estimate.tilesCount,
            maxTiles: PdfMapsService.MAX_TILES_PER_MAP,
            size: Files.toHumanReadableFileSize(estimate.estimatedSizeBytes),
            freeSpace:
              freeDiskStorage === null
                ? "-"
                : Files.toHumanReadableFileSize(freeDiskStorage),
          }}
        />
        <HView style={styles.previewRow}>
          <VView style={styles.previewStatus}>
            {previewLoading && (
              <HView style={styles.previewLoading}>
                <LoadingIcon size={16} />
                <Text
                  textKey="pdfMaps:import.preview.rendering"
                  variant="bodySmall"
                />
              </HView>
            )}
            {preview && (
              <Text
                textKey="pdfMaps:import.preview.lowResolution"
                textParams={{
                  minZoom: preview.minZoom,
                  maxZoom: preview.maxZoom,
                }}
                variant="bodySmall"
              />
            )}
            {previewErrorDetails && (
              <Text
                style={styles.errorText}
                textKey="pdfMaps:import.preview.error"
                textParams={{ details: previewErrorDetails }}
                variant="bodySmall"
              />
            )}
          </VView>
          <Text textKey="pdfMaps:hideBaseMap" variant="bodySmall" />
          <Switch onChange={setBaseMapHidden} value={baseMapHidden} />
        </HView>
      </VView>
      <MapView
        key={candidateIndex}
        baseMapHidden={baseMapHidden}
        extraTileOverlays={previewTileOverlays}
        fitToCoordinatesOnReady={neatline}
        initialRegion={initialRegion}
        showZoomControls
        style={styles.map}
        toolbarEnabled={false}
      >
        {neatline && (
          <Polygon
            coordinates={neatline}
            // the preview must be visible with its original colors
            fillColor={preview ? "transparent" : neatlineFillColor}
            strokeColor={neatlineStrokeColor}
            strokeWidth={2}
            tappable={false}
          />
        )}
      </MapView>
      <HView style={styles.buttonsRow}>
        <Button
          disabled={importing || estimate.exceedsMaxTiles || exceedsFreeSpace}
          icon="file-import-outline"
          loading={importing}
          onPress={onImportPress}
          textKey="pdfMaps:import.importButton"
        />
      </HView>
    </VView>
  );
};

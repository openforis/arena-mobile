import { useMemo } from "react";
import { Polygon } from "react-native-maps";

import {
  Button,
  Dropdown,
  HView,
  LoadingIcon,
  MapView,
  Slider,
  Switch,
  Text,
  TextInput,
  VView,
} from "components";
import { PdfMapsService } from "service";
import { useAppTheme } from "theme";
import { Files, log } from "utils";

import { getEstimateTextKey } from "./pdfMapImportUtils";
import { PdfMapImportPreviewStatus } from "./PdfMapImportPreviewStatus";
import styles from "./styles";
import { usePdfMapImport } from "./usePdfMapImport";

const neatlineStrokeColor = "rgba(21, 101, 192, 0.95)";
const neatlineFillColor = "rgba(21, 101, 192, 0.15)";

export type PdfMapImportParams = { fileUri: string; fileName: string };

export const PdfMapImportScreen = () => {
  log.debug("rendering PdfMapImportScreen");

  const theme = useAppTheme();
  const errorTextStyle = useMemo(
    () => ({ color: theme.colors.error }),
    [theme],
  );
  const {
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
  } = usePdfMapImport();

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
          style={[styles.messageText, errorTextStyle]}
          textKey={errorKey ?? "pdfMaps:import.notGeoreferenced"}
          textParams={errorParams}
        />
        <Button icon="arrow-left" onPress={onGoBack} textKey="common:goBack" />
      </VView>
    );
  }

  return (
    <VView style={styles.container}>
      <VView style={styles.header}>
        <TextInput
          error={!!nameErrorKey}
          label="pdfMaps:import.name"
          onChange={onNameChange}
          value={name}
        />
        {nameErrorKey && <Text style={errorTextStyle} textKey={nameErrorKey} />}
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
              onValueChange={onMaxZoomChange}
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
            (estimate.exceedsMaxTiles || exceedsFreeSpace) && errorTextStyle,
          ]}
          textKey={getEstimateTextKey(estimate.exceedsMaxTiles)}
          textParams={{
            tiles: estimate.tilesCount,
            maxTiles: PdfMapsService.MAX_TILES_PER_MAP,
            size: Files.toHumanReadableFileSize(estimate.estimatedSizeBytes),
            freeSpace: freeSpaceText,
          }}
        />
        <HView style={styles.previewRow}>
          <PdfMapImportPreviewStatus
            currentZoom={currentZoom}
            errorTextStyle={errorTextStyle}
            previewState={previewState}
          />
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
        onZoomChange={onZoomChange}
        style={styles.map}
        toolbarEnabled={false}
      >
        {neatline && (
          <Polygon
            coordinates={neatline}
            // the preview must be visible with its original colors
            fillColor={previewState.preview ? "transparent" : neatlineFillColor}
            strokeColor={neatlineStrokeColor}
            strokeWidth={2}
            tappable={false}
          />
        )}
      </MapView>
      <HView style={styles.buttonsRow}>
        <Button
          disabled={importDisabled}
          icon="file-import-outline"
          loading={importing}
          onPress={onImportPress}
          textKey="pdfMaps:import.importButton"
        />
      </HView>
    </VView>
  );
};

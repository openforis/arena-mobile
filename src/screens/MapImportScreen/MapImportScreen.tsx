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
import { ImportedMapsService } from "service";
import { useAppTheme } from "theme";
import { Files, log } from "utils";

import { getEstimateTextKey } from "./mapImportUtils";
import { MapImportPreviewStatus } from "./MapImportPreviewStatus";
import styles from "./styles";
import { useMapImport } from "./useMapImport";

const neatlineStrokeColor = "rgba(21, 101, 192, 0.95)";
const neatlineFillColor = "rgba(21, 101, 192, 0.15)";

export type MapImportParams = { fileUri: string; fileName: string };

export const MapImportScreen = () => {
  log.debug("rendering MapImportScreen");

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
  } = useMapImport();

  if (loading) {
    return (
      <VView style={styles.messageContainer}>
        <LoadingIcon />
        <Text
          style={styles.messageText}
          textKey="importedMaps:import.analyzing"
        />
      </VView>
    );
  }

  if (!candidate || !estimate || !selectableZoomRange) {
    return (
      <VView style={styles.messageContainer}>
        <Text
          style={[styles.messageText, errorTextStyle]}
          textKey={errorKey ?? "importedMaps:import.notGeoreferenced"}
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
          label="importedMaps:import.name"
          onChange={onNameChange}
          value={name}
        />
        {nameErrorKey && <Text style={errorTextStyle} textKey={nameErrorKey} />}
        {candidates.length > 1 && (
          <Dropdown
            items={pageItems}
            label="importedMaps:import.page"
            onChange={onPageChange}
            translateItemLabels={false}
            value={String(candidateIndex)}
          />
        )}
        {!candidate.georeference.datumCompatible && (
          <Text
            style={styles.warningText}
            textKey="importedMaps:map.datumWarning"
          />
        )}
        <HView style={styles.zoomRow}>
          <Text
            style={styles.zoomLabel}
            textKey="importedMaps:import.maxZoom"
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
            textKey="importedMaps:import.nativeZoom"
            textParams={{ value: candidate.zoomRange.nativeZoom }}
            variant="bodySmall"
          />
        </HView>
        {maxZoom > candidate.zoomRange.nativeZoom && (
          <Text
            style={styles.warningText}
            textKey="importedMaps:import.maxZoomAboveNative"
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
            maxTiles: ImportedMapsService.MAX_TILES_PER_MAP,
            size: Files.toHumanReadableFileSize(estimate.estimatedSizeBytes),
            freeSpace: freeSpaceText,
          }}
        />
        <HView style={styles.previewRow}>
          <MapImportPreviewStatus
            currentZoom={currentZoom}
            errorTextStyle={errorTextStyle}
            previewState={previewState}
          />
          <Text textKey="importedMaps:hideBaseMap" variant="bodySmall" />
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
          textKey="importedMaps:import.importButton"
        />
      </HView>
    </VView>
  );
};

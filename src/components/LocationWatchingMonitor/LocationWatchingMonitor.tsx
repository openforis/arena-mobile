import { useState } from "react";

import { log, Environment } from "utils";
import { useTranslation } from "localization";
import type { LocationWatchStatus } from "hooks";
import { GpsSourceSetting } from "model";
import { GpsSourceDescriptor } from "service/externalGps/types";
import { FieldSet } from "../FieldSet";
import { Button } from "../Button";
import { GpsDevicePairingModal } from "../GpsDevicePairingModal";
import { HView } from "../HView";
import { IconButton } from "../IconButton";
import { LoadingIcon } from "../LoadingIcon";
import { MenuButton } from "../MenuButton";
import { Text } from "../Text";
import { View } from "../View";
import { VView } from "../VView";
import { AccuracyProgressBar } from "./AccuracyProgressBar";
import { ElapsedTimeProgressBar } from "./ElapsedTimeProgressBar";

import styles from "./styles";

type LocationWatchingMonitorProps = {
  activeLocationSourceId?: string;
  availableGpsSources?: GpsSourceDescriptor[];
  connectingSourceId?: string | null;
  gpsSourcesLoading?: boolean;
  locationAccuracy?: number | string | null;
  locationAccuracyThreshold: number;
  locationSourceUnavailable?: boolean;
  locationWatchElapsedTime: number;
  locationWatchStatus: LocationWatchStatus;
  locationWatchTimeout: number;
  onCancelConnecting?: () => void;
  onGpsDevicePaired?: (source: GpsSourceDescriptor) => void;
  onSelectGpsSource?: (sourceId: string) => void;
  onStart: () => void;
  onStop: () => void;
  preferredGpsSourceId?: string;
};

export const LocationWatchingMonitor = (
  props: LocationWatchingMonitorProps
) => {
  const {
    activeLocationSourceId,
    availableGpsSources = [],
    connectingSourceId,
    gpsSourcesLoading = false,
    locationAccuracy,
    locationAccuracyThreshold,
    locationSourceUnavailable,
    locationWatchElapsedTime,
    locationWatchStatus,
    locationWatchTimeout,
    onCancelConnecting,
    onGpsDevicePaired,
    onSelectGpsSource,
    onStart,
    onStop,
    preferredGpsSourceId,
  } = props;

  log.debug(`rendering LocationWatchingMonitor`);

  const { t } = useTranslation();

  const [devicePairingModalVisible, setDevicePairingModalVisible] =
    useState(false);

  const isIdle = locationWatchStatus === "idle";
  const isConnecting = locationWatchStatus === "connecting";
  const isWatching = locationWatchStatus === "watching";

  const getSourceLabel = (sourceId?: string | null) => {
    if (!sourceId) return "";
    const source = availableGpsSources.find((item) => item.id === sourceId);
    return source?.label ?? t("dataEntry:coordinate.externalGpsGenericLabel");
  };

  // Only worth showing a source picker once there's an actual choice - i.e. at
  // least one recognized external GPS device is bonded, in addition to internal.
  // Hidden while connecting/watching to avoid swapping source mid-capture (would
  // confuse in-flight location averaging).
  const gpsSourceMenuVisible =
    isIdle && !!onSelectGpsSource && availableGpsSources.length > 1;

  // Bluetooth Classic pairing (bluetoothClassicTransport) is Android-only; see the
  // same gating in GpsSourceSettingsField.
  const pairDeviceButtonVisible =
    isIdle && !!onGpsDevicePaired && Environment.isAndroid;

  const gpsSourceMenuItems = gpsSourceMenuVisible
    ? [
        {
          key: GpsSourceSetting.auto,
          label: "settings:preferredGpsSourceId.auto",
          icon:
            preferredGpsSourceId === GpsSourceSetting.auto
              ? "check"
              : undefined,
          onPress: () => onSelectGpsSource!(GpsSourceSetting.auto),
        },
        ...availableGpsSources.map((source) => ({
          key: source.id,
          label:
            source.type === "internal"
              ? "settings:preferredGpsSourceId.internal"
              : source.label,
          icon: preferredGpsSourceId === source.id ? "check" : undefined,
          onPress: () => onSelectGpsSource!(source.id),
        })),
      ]
    : [];

  const locationAccuracyFormatted =
    typeof locationAccuracy === "string"
      ? locationAccuracy
      : locationAccuracy?.toFixed?.(2);

  // Shown only when an external device is actually relevant this session - either
  // it's the active source, or we fell back from it to internal GPS. The plain
  // "internal GPS only, no external device involved" case stays unchanged.
  const activeSourceIsExternal =
    !!activeLocationSourceId &&
    activeLocationSourceId !== GpsSourceSetting.internal;
  const showActiveSourceLine =
    isWatching && (activeSourceIsExternal || !!locationSourceUnavailable);

  return (
    <VView style={styles.outerContainer}>
      {isConnecting && (
        <Text
          textKey="dataEntry:coordinate.connectingToSource"
          textParams={{ label: getSourceLabel(connectingSourceId) }}
        />
      )}
      {isWatching && (
        <>
          <FieldSet headerKey="dataEntry:coordinate.accuracy">
            <HView>
              <View style={styles.accuracyProgressBarWrapper}>
                <AccuracyProgressBar
                  accuracy={Number(locationAccuracy)}
                  accuracyThreshold={locationAccuracyThreshold}
                />
              </View>
              <Text>{locationAccuracyFormatted} m</Text>
            </HView>
          </FieldSet>
          <ElapsedTimeProgressBar
            elapsedTime={locationWatchElapsedTime}
            elapsedTimeThreshold={locationWatchTimeout}
          />
          {showActiveSourceLine && (
            <Text
              style={styles.sourceStatusText}
              textKey={
                locationSourceUnavailable
                  ? "dataEntry:coordinate.usingInternalFallback"
                  : "dataEntry:coordinate.usingSource"
              }
              textParams={{
                label: locationSourceUnavailable
                  ? getSourceLabel(connectingSourceId)
                  : getSourceLabel(activeLocationSourceId),
              }}
            />
          )}
        </>
      )}
      {isIdle && (
        <HView fullWidth style={styles.startRow}>
          <Button
            icon="play"
            onPress={onStart}
            style={styles.button}
            textKey="dataEntry:coordinate.getLocation"
          />
          {gpsSourcesLoading ? (
            <LoadingIcon size={24} style={styles.gpsSourceLoadingIcon} />
          ) : (
            gpsSourceMenuVisible && (
              <MenuButton
                icon="crosshairs-gps"
                items={gpsSourceMenuItems}
                label="settings:preferredGpsSourceId.label"
                mode="text"
              />
            )
          )}
          {pairDeviceButtonVisible && (
            <IconButton
              icon="bluetooth"
              onPress={() => setDevicePairingModalVisible(true)}
            />
          )}
        </HView>
      )}
      {isConnecting && (
        <Button
          icon="close"
          onPress={onCancelConnecting}
          style={styles.button}
          textKey="common:cancel"
        />
      )}
      {isWatching && (
        <Button
          icon="stop"
          onPress={onStop}
          style={styles.button}
          textKey="common:stop"
        />
      )}
      {devicePairingModalVisible && (
        <GpsDevicePairingModal
          onDevicePaired={(source) => {
            setDevicePairingModalVisible(false);
            onGpsDevicePaired!(source);
          }}
          onDismiss={() => setDevicePairingModalVisible(false)}
        />
      )}
    </VView>
  );
};

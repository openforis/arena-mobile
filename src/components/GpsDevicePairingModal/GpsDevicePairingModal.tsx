import { useCallback, useState } from "react";
import { FlatList } from "react-native";
import { List as RNPList } from "react-native-paper";

import {
  Button,
  CollapsiblePanel,
  LoadingIcon,
  Modal,
  Text,
  VView,
} from "components";
import { useGpsDeviceDiscovery, useToast } from "hooks";
import { ExternalGpsService } from "service/externalGps/ExternalGpsService";
import { DiscoveredGpsDevice, GpsSourceDescriptor } from "service/externalGps/types";
import { log } from "utils";
import { SystemUtils } from "utils/SystemUtils";

import styles from "./styles";

type GpsDevicePairingModalProps = {
  onDevicePaired: (source: GpsSourceDescriptor) => void;
  onDismiss: () => void;
};

const deviceLabel = (device: DiscoveredGpsDevice) => device.name || device.address;

type DevicePairButtonProps = {
  pairing: boolean;
  onPress: () => void;
};

const DevicePairButton = (props: DevicePairButtonProps) => {
  const { pairing, onPress } = props;
  return (
    <Button
      compact
      disabled={pairing}
      loading={pairing}
      mode="outlined"
      onPress={onPress}
      textKey="settings:gpsDevicePairing.pairButton"
    />
  );
};

export const GpsDevicePairingModal = (props: GpsDevicePairingModalProps) => {
  const { onDevicePaired, onDismiss } = props;

  const { devices, scanning, error, start, stop } = useGpsDeviceDiscovery();
  const showToast = useToast();

  const [hasScanned, setHasScanned] = useState(false);
  const [enablingBluetooth, setEnablingBluetooth] = useState(false);
  const [pairingAddress, setPairingAddress] = useState<string | null>(null);

  const onScanPress = useCallback(async () => {
    setHasScanned(true);
    await start();
  }, [start]);

  const onEnableBluetoothPress = useCallback(async () => {
    setEnablingBluetooth(true);
    try {
      if (await ExternalGpsService.requestBluetoothEnabled()) {
        await onScanPress();
      }
    } finally {
      setEnablingBluetooth(false);
    }
  }, [onScanPress]);

  const onOpenSettingsPress = useCallback(() => {
    SystemUtils.openAppSettings();
  }, []);

  const onPairPress = useCallback(
    async (device: DiscoveredGpsDevice) => {
      setPairingAddress(device.address);
      try {
        const source = await ExternalGpsService.pairGpsDevice(device.address);
        await stop();
        showToast("settings:gpsDevicePairing.pairingSucceeded", {
          name: deviceLabel(device),
        });
        onDevicePaired(source);
      } catch (pairError) {
        log.warn("GpsDevicePairingModal: pairing failed", pairError);
        showToast("settings:gpsDevicePairing.pairingFailed", {
          name: deviceLabel(device),
        });
      } finally {
        setPairingAddress(null);
      }
    },
    [onDevicePaired, showToast, stop],
  );

  const recognizedDevices = devices.filter((device) => !!device.vendor);
  const unrecognizedDevices = devices.filter((device) => !device.vendor);

  const renderDeviceRow = useCallback(
    (device: DiscoveredGpsDevice) => (
      <RNPList.Item
        key={device.address}
        description={device.vendor}
        right={() => (
          <DevicePairButton
            pairing={pairingAddress === device.address}
            onPress={() => onPairPress(device)}
          />
        )}
        title={deviceLabel(device)}
      />
    ),
    [onPairPress, pairingAddress],
  );

  return (
    <Modal onDismiss={onDismiss} titleKey="settings:gpsDevicePairing.title">
      <VView style={styles.container}>
        {error === "bluetooth_disabled" && (
          <VView style={styles.messageContainer}>
            <Text textKey="settings:gpsDevicePairing.bluetoothDisabled" />
            <Button
              loading={enablingBluetooth}
              onPress={onEnableBluetoothPress}
              style={styles.actionButton}
              textKey="settings:gpsDevicePairing.enableBluetoothButton"
            />
          </VView>
        )}

        {error === "permission_denied" && (
          <VView style={styles.messageContainer}>
            <Text textKey="settings:gpsDevicePairing.permissionDenied" />
            <Button
              onPress={onOpenSettingsPress}
              style={styles.actionButton}
              textKey="settings:gpsDevicePairing.openSettingsButton"
            />
            <Button
              mode="outlined"
              onPress={onScanPress}
              style={styles.actionButton}
              textKey="settings:gpsDevicePairing.scanAgainButton"
            />
          </VView>
        )}

        {error === "unknown" && (
          <VView style={styles.messageContainer}>
            <Text textKey="settings:gpsDevicePairing.scanFailed" />
            <Button
              onPress={onScanPress}
              style={styles.actionButton}
              textKey="settings:gpsDevicePairing.scanAgainButton"
            />
          </VView>
        )}

        {!error && !hasScanned && (
          <Button onPress={onScanPress} textKey="settings:gpsDevicePairing.scanButton" />
        )}

        {!error && hasScanned && (
          <>
            {scanning && (
              <VView style={styles.scanningRow}>
                <LoadingIcon size={20} />
                <Text textKey="settings:gpsDevicePairing.scanningLabel" />
              </VView>
            )}

            {!scanning && devices.length === 0 && (
              <VView style={styles.messageContainer}>
                <Text textKey="settings:gpsDevicePairing.emptyResult" />
                <Button
                  onPress={onScanPress}
                  style={styles.actionButton}
                  textKey="settings:gpsDevicePairing.scanAgainButton"
                />
              </VView>
            )}

            {recognizedDevices.length > 0 && (
              <FlatList
                data={recognizedDevices}
                keyExtractor={(device) => device.address}
                renderItem={({ item }) => renderDeviceRow(item)}
              />
            )}

            {unrecognizedDevices.length > 0 && (
              <CollapsiblePanel headerKey="settings:gpsDevicePairing.showAllDevices">
                {unrecognizedDevices.map((device) => renderDeviceRow(device))}
              </CollapsiblePanel>
            )}
          </>
        )}
      </VView>
    </Modal>
  );
};

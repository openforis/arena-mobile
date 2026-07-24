import { useCallback, useState } from "react";
import { FlatList } from "react-native";
import { List as RNPList } from "react-native-paper";

import { Button, LoadingIcon, Modal, Text, VView } from "components";
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

type MessageActionProps = {
  textKey: string;
  onPress: () => void;
  mode?: "outlined";
  loading?: boolean;
};

type MessageWithActionsProps = {
  messageKey: string;
  actions: MessageActionProps[];
};

const MessageWithActions = (props: MessageWithActionsProps) => {
  const { messageKey, actions } = props;
  return (
    <VView style={styles.messageContainer}>
      <Text textKey={messageKey} />
      {actions.map((action) => (
        <Button
          key={action.textKey}
          loading={action.loading}
          mode={action.mode}
          onPress={action.onPress}
          style={styles.actionButton}
          textKey={action.textKey}
        />
      ))}
    </VView>
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

  const renderDeviceRow = useCallback(
    (device: DiscoveredGpsDevice) => {
      const pairing = pairingAddress === device.address;
      return (
        <RNPList.Item
          key={device.address}
          description={device.vendor}
          disabled={pairing}
          left={(iconProps) => <RNPList.Icon {...iconProps} icon="bluetooth-connect" />}
          onPress={() => onPairPress(device)}
          right={pairing ? (iconProps) => <LoadingIcon size={20} style={iconProps.style} /> : undefined}
          title={deviceLabel(device)}
        />
      );
    },
    [onPairPress, pairingAddress],
  );

  return (
    <Modal onDismiss={onDismiss} titleKey="settings:gpsDevicePairing.title">
      <VView style={styles.container}>
        {error === "bluetooth_disabled" && (
          <MessageWithActions
            actions={[
              {
                textKey: "settings:gpsDevicePairing.enableBluetoothButton",
                onPress: onEnableBluetoothPress,
                loading: enablingBluetooth,
              },
            ]}
            messageKey="settings:gpsDevicePairing.bluetoothDisabled"
          />
        )}

        {error === "permission_denied" && (
          <MessageWithActions
            actions={[
              { textKey: "settings:gpsDevicePairing.openSettingsButton", onPress: onOpenSettingsPress },
              { textKey: "settings:gpsDevicePairing.scanAgainButton", onPress: onScanPress, mode: "outlined" },
            ]}
            messageKey="settings:gpsDevicePairing.permissionDenied"
          />
        )}

        {error === "unknown" && (
          <MessageWithActions
            actions={[{ textKey: "settings:gpsDevicePairing.scanAgainButton", onPress: onScanPress }]}
            messageKey="settings:gpsDevicePairing.scanFailed"
          />
        )}

        {!error && !hasScanned && (
          <Button onPress={onScanPress} style={styles.scanForDevicesButton} textKey="settings:gpsDevicePairing.scanButton" />
        )}

        {!error && hasScanned && (
          <>
            <Text
              style={styles.recognizedDevicesNotice}
              textKey="settings:gpsDevicePairing.recognizedDevicesNotice"
              variant="bodySmall"
            />

            {scanning && (
              <VView style={styles.scanningRow}>
                <LoadingIcon size={20} />
                <Text textKey="settings:gpsDevicePairing.scanningLabel" />
              </VView>
            )}

            {!scanning && recognizedDevices.length === 0 && (
              <MessageWithActions
                actions={[{ textKey: "settings:gpsDevicePairing.scanAgainButton", onPress: onScanPress }]}
                messageKey="settings:gpsDevicePairing.emptyResult"
              />
            )}

            {recognizedDevices.length > 0 && (
              <FlatList
                data={recognizedDevices}
                keyExtractor={(device) => device.address}
                renderItem={({ item }) => renderDeviceRow(item)}
              />
            )}
          </>
        )}
      </VView>
    </Modal>
  );
};

import { useCallback, useEffect, useState } from "react";
import {
  BarcodeScanningResult,
  BarcodeSettings,
  CameraView,
} from "expo-camera";

import { Markdown, Modal, View } from "components";
import { useRequestCameraPermission } from "hooks/useRequestCameraPermission";
import { i18n } from "localization";

import styles from "./styles";

const barcodeScannerSettings: BarcodeSettings = {
  barcodeTypes: ["qr"],
};

type QrScannerModalProps = {
  onData: (data: string) => Promise<void>;
  onDismiss: () => void;
  titleKey: string;
};

export const QrScannerModal = (props: QrScannerModalProps) => {
  const { onData, onDismiss, titleKey } = props;

  const [enabled, setEnabled] = useState(false);

  const { request: requestCameraPermission } = useRequestCameraPermission();

  useEffect(() => {
    const checkPermissionAndEnable = async () => {
      if (await requestCameraPermission()) {
        setEnabled(true);
      }
    };
    checkPermissionAndEnable();
  }, [requestCameraPermission]);

  const onBarcodeScanned = useCallback(
    async (result: BarcodeScanningResult) => {
      const { data } = result;
      await onData(data);
    },
    [onData],
  );

  if (!enabled) {
    return null;
  }

  return (
    <Modal onDismiss={onDismiss} titleKey={titleKey}>
      <View style={styles.container}>
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={barcodeScannerSettings}
          onBarcodeScanned={onBarcodeScanned}
        />
        <View transparent style={styles.overlay}>
          <View transparent style={styles.unfocusedContainer}></View>
          <View transparent style={styles.middleContainer}>
            {/* Left dark side */}
            <View transparent style={styles.unfocusedContainer} />
            {/* The Clear Square */}
            <View transparent style={styles.focusedContainer} />
            {/* Right dark side */}
            <View transparent style={styles.unfocusedContainer} />
          </View>
          <View transparent style={styles.unfocusedContainer}>
            <Markdown
              content={i18n.t(
                "settingsRemoteConnection:loginUsingQrCodeInstructions",
              )}
              style={styles.instructionText as any}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

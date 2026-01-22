import { useCallback, useEffect, useState } from "react";
import {
  BarcodeScanningResult,
  BarcodeSettings,
  CameraView,
} from "expo-camera";

import { Markdown, Modal, View } from "components";
import { useRequestCameraPermission } from "hooks/useRequestCameraPermission";
import { i18n } from "localization";
import { SystemUtils } from "utils/SystemUtils";

import { QrScannerOverlay } from "./QrScannerOverlay";
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

    SystemUtils.lockOrientationToPortrait();

    return () => {
      SystemUtils.unlockOrientation();
    };
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
      <View transparent style={styles.container}>
        {/* The Camera View Component */}
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={barcodeScannerSettings}
          onBarcodeScanned={onBarcodeScanned}
        />

        {/* The SVG Mask Component */}
        <QrScannerOverlay />

        {/* Instructions at the bottom */}
        <View transparent style={styles.instructionsContainer}>
          <Markdown
            content={i18n.t(
              "settingsRemoteConnection:loginUsingQrCodeInstructions",
            )}
            style={styles.instructionsMarkdown}
          />
        </View>
      </View>
    </Modal>
  );
};

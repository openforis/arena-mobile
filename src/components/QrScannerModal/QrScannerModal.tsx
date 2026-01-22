import { useCallback, useEffect, useState } from "react";
import {
  BarcodeScanningResult,
  BarcodeSettings,
  CameraView,
} from "expo-camera";

import { Markdown, Modal, Text, View } from "components";
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
    const init = async () => {
      if (await requestCameraPermission()) {
        setEnabled(true);
      }
      await SystemUtils.lockOrientationToPortrait();
    };
    init();

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

  let permissionDeniedMessage = "";
  if (!enabled) {
    const permissionLabel = i18n.t(`permissions:types.camera`);
    permissionDeniedMessage = i18n.t("permissions:permissionDenied", {
      permission: permissionLabel,
    });
  }

  return (
    <Modal onDismiss={onDismiss} titleKey={titleKey}>
      {enabled ? (
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
      ) : (
        <Text>{permissionDeniedMessage}</Text>
      )}
    </Modal>
  );
};

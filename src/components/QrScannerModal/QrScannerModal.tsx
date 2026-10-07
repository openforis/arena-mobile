import { useCallback, useEffect, useState } from "react";
import {
  BarcodeScanningResult,
  BarcodeSettings,
  CameraView,
} from "expo-camera";

import { Loader } from "../Loader";
import { Markdown } from "../Markdown";
import { Modal } from "../Modal";
import { Text } from "../Text";
import { View } from "../View";
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

  const [loading, setLoading] = useState(true);
  const [cameraAccessAllowed, setCameraAccessAllowed] = useState(false);

  const { request: requestCameraPermission } = useRequestCameraPermission();

  useEffect(() => {
    const init = async () => {
      if (await requestCameraPermission()) {
        setCameraAccessAllowed(true);
      }
      await SystemUtils.lockOrientationToPortrait();
      setLoading(false);
    };
    void init();

    return () => {
      void SystemUtils.unlockOrientation();
    };
  }, [requestCameraPermission]);

  const onBarcodeScanned = useCallback(
    async (result: BarcodeScanningResult) => {
      const { data } = result;
      await onData(data);
    },
    [onData],
  );

  const permissionDeniedMessage = cameraAccessAllowed
    ? ""
    : i18n.t("permissions:permissionDenied", {
        permission: i18n.t(`permissions:types.camera`),
      });

  return (
    <Modal onDismiss={onDismiss} titleKey={titleKey}>
      {loading && <Loader />}
      {!loading && cameraAccessAllowed && (
        <View style={styles.container}>
          {/* The Camera View Component */}
          <CameraView
            barcodeScannerSettings={barcodeScannerSettings}
            facing="back"
            onBarcodeScanned={onBarcodeScanned}
            style={styles.camera}
          />

          {/* The SVG Mask Component */}
          <QrScannerOverlay />

          {/* Instructions at the bottom */}
          <View style={styles.instructionsContainer}>
            <Markdown
              content={i18n.t(
                "settingsRemoteConnection:loginUsingQrCodeInstructions",
              )}
              style={styles.instructionsMarkdown}
            />
          </View>
        </View>
      )}
      {!loading && !cameraAccessAllowed && (
        <Text>{permissionDeniedMessage}</Text>
      )}
    </Modal>
  );
};

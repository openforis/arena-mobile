import React, {useCallback, useRef} from 'react';
import {RNCamera} from 'react-native-camera';
import QRCodeScanner from 'react-native-qrcode-scanner';

import {CustomMarker, TopContent} from './components';
import styles from './styles';

const QRScanner = ({
  visible = false,
  onRead,
  qrData,
  cleanData,
  handleClose,
}) => {
  const scanner = useRef(null);

  const handleReactivate = useCallback(() => {
    scanner?.current?.reactivate();
    cleanData();
  }, [scanner, cleanData]);

  if (!visible) {
    return null;
  }

  return (
    <QRCodeScanner
      ref={scanner}
      containerStyle={[styles.container]}
      cameraStyle={[styles.camera]}
      topViewStyle={[styles.topView]}
      bottomViewStyle={[styles.bottomView]}
      showMarker={true}
      onRead={onRead}
      reactivate={false}
      fadeIn={false}
      customMarker={
        <CustomMarker
          qrData={qrData}
          visible={visible}
          handleClose={handleClose}
          handleReactivate={handleReactivate}
        />
      }
      flashMode={RNCamera.Constants.FlashMode.off}
      topContent={<TopContent handleClose={handleClose} />}
    />
  );
};

export default QRScanner;

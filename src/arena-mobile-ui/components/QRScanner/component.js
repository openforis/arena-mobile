import React, {useCallback, useRef} from 'react';
import {RNCamera} from 'react-native-camera';
import QRCodeScanner from 'react-native-qrcode-scanner';

import {BottomContent, TopContent} from './components';
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
      markerStyle={[styles.marker]}
      showMarker={true}
      onRead={onRead}
      reactivate={false}
      fadeIn={false}
      flashMode={RNCamera.Constants.FlashMode.off}
      topContent={<TopContent handleClose={handleClose} qrData={qrData} />}
      bottomContent={
        <BottomContent
          visible={visible && !!qrData}
          handleClose={handleClose}
          handleReactivate={handleReactivate}
        />
      }
    />
  );
};

export default QRScanner;

import React, {useCallback, useRef} from 'react';
import QRCodeScanner from 'react-native-qrcode-scanner';

import {CustomMarker, TopContent} from './components';
import styles from './styles';

const QRScanner = ({
  visible,
  onRead,
  qrData,
  cleanData,
  handleClose,
  flashMode,
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
      containerStyle={styles.container}
      cameraStyle={styles.camera}
      topViewStyle={styles.topView}
      bottomViewStyle={styles.bottomView}
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
      flashMode={flashMode}
      topContent={<TopContent handleClose={handleClose} />}
    />
  );
};

QRScanner.defaultProps = {
  visible: false,
  onRead: () => {},
  qrData: null,
  cleanData: () => {},
  handleClose: () => {},
  flashMode: 'off',
};

export default QRScanner;

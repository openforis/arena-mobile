import React from 'react';

import {TouchableIcon} from 'arena-mobile-ui/components/TouchableIcons';

const QRScannerButton = ({handleShow}) => (
  <TouchableIcon onPress={handleShow} iconName={'qrcode-scan'} />
);

export default QRScannerButton;

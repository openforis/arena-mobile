import React from 'react';

import {TouchableIcon} from 'arena-mobile-ui/components/TouchableIcons';

const QRScannerButton = ({handleShow}) => (
  <TouchableIcon onPress={handleShow} iconName={'scan'} />
);

export default QRScannerButton;

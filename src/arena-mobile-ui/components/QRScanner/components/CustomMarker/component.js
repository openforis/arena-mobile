import React from 'react';
import {View} from 'react-native';

import BottomContent from '../BottomContent';

import styles from './styles';

const CustomMarker = ({handleReactivate, handleClose, qrData, visible}) => (
  <View style={[styles.container]}>
    <View style={[styles.translucid]} />
    <View style={[styles.row]}>
      <View style={[styles.translucid]} />
      <View style={[styles.marker]} />
      <View style={[styles.translucid]} />
    </View>
    <View style={[styles.translucid]} />
    <View style={[styles.payload]}>
      <BottomContent
        qrData={qrData}
        visible={visible && !!qrData}
        handleClose={handleClose}
        handleReactivate={handleReactivate}
      />
    </View>
  </View>
);

export default CustomMarker;

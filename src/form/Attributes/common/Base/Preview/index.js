import React from 'react';
import {View, Text} from 'react-native';

const BasePreview = ({nodeDef, type}) => (
  <View>
    <Text>
      {nodeDef.type} - {type} - Not suported
    </Text>
  </View>
);

export default BasePreview;

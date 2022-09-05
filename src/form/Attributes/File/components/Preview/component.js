import React from 'react';
import {Platform, View, Image} from 'react-native';

import * as fs from 'infra/fs';

import styles from './styles';

const getFileUri = file => {
  const relativePath = fs.cleanPathWithBase(file.uri);

  if (Platform.OS === 'ios') {
    return '~' + relativePath.substring(relativePath.indexOf('/Documents'));
  }
  return relativePath;
};

const Preview = ({file}) => {
  return (
    <View style={styles.container}>
      <View style={styles.imgContainer}>
        {file?.uri && (
          <Image
            resizeMode="cover"
            style={styles.image}
            resizeMethod="scale"
            source={{
              uri: getFileUri(file),
            }}
          />
        )}
      </View>
    </View>
  );
};

export default Preview;

import React from 'react';
import {Platform, View, Image} from 'react-native';

import * as fs from 'infra/fs';

import styles from './styles';

const getFileUri = file => {
  const relativePath = fs.cleanPathWithBase(file.uri);

  if (Platform.OS === 'ios') {
    return '~' + relativePath.substring(relativePath.indexOf('/Documents'));
  }
  return 'file:///' + relativePath;
};

export const FileImage = ({file}) => {
  return (
    <Image
      resizeMode="cover"
      style={styles.image}
      resizeMethod="scale"
      source={{
        uri: getFileUri(file),
      }}
    />
  );
};

const Preview = ({file}) => {
  return (
    <View style={styles.container}>
      <View style={styles.imgContainer}>
        {file?.uri && <FileImage file={file} />}
      </View>
    </View>
  );
};

export default Preview;

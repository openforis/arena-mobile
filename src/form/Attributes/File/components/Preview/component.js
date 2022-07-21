import React from 'react';
import {Platform, View, Image} from 'react-native';

import styles from './styles';

const getFileUri = file => {
  if (Platform.OS === 'ios') {
    return '~' + file.uri.substring(file.uri.indexOf('/Documents'));
  }
  return file.uri;
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

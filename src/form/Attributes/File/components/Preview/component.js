import React, {useMemo} from 'react';
import {Platform, View, Image, StyleSheet} from 'react-native';

import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import * as fs from 'infra/fs';

import _styles, {MaxPreviewSize} from './styles';

const getFileUri = file => {
  const relativePath = fs.cleanPathWithBase(file.uri);

  if (Platform.OS === 'ios') {
    return '~' + relativePath.substring(relativePath.indexOf('/Documents'));
  }
  return 'file:///' + relativePath;
};

export const FileImage = ({file}) => {
  const styles = useThemedStyles(_styles);
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

const ImageStats = ({file}) => {
  const fileSizeMB = useMemo(() => {
    return String((file.meta.fileSize / 1024 || 0).toFixed(2));
  }, [file]);

  return (
    <TextBase type="secondaryLight">
      {fileSizeMB} KB · ({file.meta.width} x {file.meta.height} px)
    </TextBase>
  );
};

const Preview = ({file}) => {
  const styles = useThemedStyles(_styles);
  const imgContainerStyle = useMemo(() => {
    return StyleSheet.compose(
      styles.imgContainer,
      file?.meta?.width && file?.meta?.height
        ? {
            width:
              (file.meta.width / Math.min(file.meta.width, file.meta.height)) *
              MaxPreviewSize,
            height:
              (file.meta.height / Math.min(file.meta.width, file.meta.height)) *
              MaxPreviewSize,
          }
        : {},
    );
  }, [styles, file]);

  return (
    <View style={styles.container}>
      <View style={imgContainerStyle}>
        {file?.uri && <FileImage file={file} />}
      </View>
      {file?.meta && <ImageStats file={file} />}
    </View>
  );
};

export default Preview;

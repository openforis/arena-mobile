import Clipboard from '@react-native-clipboard/clipboard';
import React, {useCallback, useMemo} from 'react';
import {StyleSheet} from 'react-native';

import {TouchableIcon} from 'arena-mobile-ui/components/TouchableIcons';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import {Objects} from 'infra/objectUtils';

import _styles from './styles';

const CopyToClipboard = ({customStyle, value}) => {
  const styles = useThemedStyles(_styles);

  const touchableStyle = useMemo(() => {
    return StyleSheet.compose(styles.button, customStyle);
  }, [styles, customStyle]);

  const handleCopytoClipboard = useCallback(() => {
    if (Objects.isEmpty(value)) {
      return;
    }
    Clipboard.setString(value);
  }, [value]);

  if (Objects.isEmpty(value)) {
    return null;
  }
  return (
    <TouchableIcon
      iconName="content-copy"
      onPress={handleCopytoClipboard}
      customStyle={touchableStyle}
    />
  );
};

CopyToClipboard.defaultProps = {
  customStyle: null,
};

export default CopyToClipboard;

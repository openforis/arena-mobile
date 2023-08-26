import Clipboard from '@react-native-clipboard/clipboard';
import React, {useCallback} from 'react';

import {TouchableIcon} from 'arena-mobile-ui/components/TouchableIcons';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';

import _styles from './styles';

const CopyToClipboard = ({customStyle, value}) => {
  const styles = useThemedStyles(_styles);

  const touchableStyle = [styles.entitySelectorButton, customStyle];

  const handleCopytoClipboard = useCallback(() => {
    Clipboard.setString(value);
  }, [value]);

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

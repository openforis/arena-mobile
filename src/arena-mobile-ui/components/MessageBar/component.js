import React, {useMemo} from 'react';
import {View, StyleSheet} from 'react-native';

import Button from 'arena-mobile-ui/components/Button';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';

import _styles from './styles';

const MessageBar = ({
  label,
  type,
  customContainerStyle,
  onPress,
  buttonLabel,
  buttonIcon,
  buttonIconPosition,
}) => {
  const styles = useThemedStyles(_styles);

  const containerStyle = useMemo(() => {
    return StyleSheet.compose(
      StyleSheet.compose(styles.container, styles[type] || {}),
      customContainerStyle,
    );
  }, [styles, type, customContainerStyle]);

  return (
    <View style={containerStyle}>
      {label}

      {buttonLabel && (
        <Button
          label={buttonLabel}
          onPress={onPress}
          type="ghostBlack"
          customContainerStyle={styles.button}
          allowMultipleLines={true}
          icon={buttonIcon}
          iconPosition={buttonIconPosition}
        />
      )}
    </View>
  );
};

MessageBar.defaultProps = {
  onPress: () => {},

  buttonLabel: false,
  type: 'info',
  buttonIcon: null,
  buttonIconPosition: 'left',
};

export default MessageBar;

import React, {useCallback} from 'react';
import {Pressable as PressableRaw, StyleSheet} from 'react-native';

const Pressable = ({
  onPress,
  hitSlop,
  style,
  disabled,
  children,
  onLongPress,
  accessibilityState,
}) => {
  const customStyle = useCallback(
    ({pressed}) => {
      return StyleSheet.compose(style || {}, {opacity: pressed ? 0.5 : 1});
    },
    [style],
  );

  return (
    <PressableRaw
      onPress={onPress}
      onLongPress={onLongPress}
      hitSlop={hitSlop}
      style={customStyle}
      accessibilityState={accessibilityState}
      disabled={disabled}>
      {children}
    </PressableRaw>
  );
};

Pressable.defaultProps = {
  onPress: () => {},
  hitSlop: 20,
  style: {},
  disabled: false,
  children: null,
  onLongPress: () => {},
  accessibilityState: {},
};

export default Pressable;

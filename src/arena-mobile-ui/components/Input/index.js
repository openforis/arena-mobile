import React from 'react';
import {Text, View, TextInput} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';
import baseStyles from 'arena-mobile-ui/styles';

import styles from './styles';

export const InputContainer = ({
  title,
  horizontal,
  stacked,
  children,
  hasTitle,
}) => {
  return (
    <View
      style={[
        styles.container,
        horizontal ? styles.horizontalContainer : {},
        stacked ? styles.stacked : {},
      ]}>
      {hasTitle && (
        <Text
          style={[
            baseStyles.textStyle.text,
            horizontal ? styles.horizontalTitle : {},
          ]}>
          {title}
        </Text>
      )}
      {children}
    </View>
  );
};

const CUSTOM_STYLE = {};

const Input = ({
  onChange,
  onChangeText,
  title,
  autoFocus = false,
  horizontal = false,
  stacked = false,
  customStyle = CUSTOM_STYLE,

  ...props
}) => {
  return (
    <InputContainer title={title} stacked={stacked} horizontal={horizontal}>
      <TextInput
        style={[styles.input, customStyle]}
        onChange={onChange}
        onChangeText={onChangeText}
        autoFocus={autoFocus}
        selectTextOnFocus={true}
        placeholderTextColor={colors.neutralLightest}
        {...props}
      />
    </InputContainer>
  );
};

export default Input;

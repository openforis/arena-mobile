import React, {useRef, useEffect} from 'react';
import {View, TextInput} from 'react-native';

import * as colors from 'arena-mobile-ui/colors';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';
import {Objects} from 'infra/objectUtils';

import _styles from './styles';

export const InputContainer = ({
  title,
  horizontal,
  stacked,
  children,
  hasTitle,
}) => {
  const styles = useThemedStyles({styles: _styles});
  return (
    <View
      style={[
        styles.container,
        horizontal ? styles.horizontalContainer : {},
        stacked ? styles.stacked : {},
      ]}>
      {hasTitle && (
        <TextBase customStyle={horizontal ? styles.horizontalTitle : {}}>
          {title}
        </TextBase>
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
  lateFocus = false,
  editable = true,
  ...props
}) => {
  const styles = useThemedStyles({styles: _styles});
  const inputRef = useRef();
  useEffect(() => {
    if (lateFocus) {
      setTimeout(() => {
        inputRef?.current?.focus?.();
      }, 300);
    }
  }, [lateFocus]);
  return (
    <InputContainer
      title={title}
      hasTitle={!Objects.isEmpty(title)}
      stacked={stacked}
      horizontal={horizontal}>
      <TextInput
        ref={inputRef}
        style={[
          styles.input,
          editable === false ? styles.noEditable : {},
          customStyle,
        ]}
        onChange={onChange}
        onChangeText={onChangeText}
        autoFocus={autoFocus}
        selectTextOnFocus={true}
        placeholderTextColor={colors.neutralLightest}
        editable={editable}
        {...props}
      />
    </InputContainer>
  );
};

export default Input;

import React, {useRef, useEffect, useMemo} from 'react';
import {View, TextInput, StyleSheet} from 'react-native';

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
  const styles = useThemedStyles(_styles);

  const containerStyle = useMemo(() => {
    return StyleSheet.compose(
      StyleSheet.compose(
        styles.container,
        horizontal ? styles.horizontalContainer : {},
      ),
      stacked ? styles.stacked : {},
    );
  }, [horizontal, stacked, styles]);

  const titleStyle = useMemo(
    () => (horizontal ? styles.horizontalTitle : styles.title),
    [horizontal, styles],
  );

  return (
    <View style={containerStyle}>
      {hasTitle && <TextBase customStyle={titleStyle}>{title}</TextBase>}
      {children}
    </View>
  );
};

const CUSTOM_STYLE = {};

const Input = ({
  onChange,
  onChangeText,
  title,
  autoFocus,
  horizontal,
  stacked,
  customStyle,
  lateFocus,
  editable,
  clear,
  multiline,
  ...props
}) => {
  const styles = useThemedStyles(_styles);
  const inputRef = useRef();
  useEffect(() => {
    if (lateFocus) {
      setTimeout(() => {
        inputRef?.current?.focus?.();
      }, 300);
    }
  }, [lateFocus]);

  const textInputStyle = useMemo(() => {
    return StyleSheet.compose(
      StyleSheet.compose(
        styles.input,
        editable === false ? styles.noEditable : {},
      ),
      customStyle,
    );
  }, [editable, styles, customStyle]);

  useEffect(() => {
    if (clear) {
      inputRef?.current?.clear?.();
    }
  }, [clear]);

  return (
    <InputContainer
      title={title}
      hasTitle={!Objects.isEmpty(title)}
      stacked={stacked}
      horizontal={horizontal}
      multiline={multiline}>
      <TextInput
        ref={inputRef}
        style={textInputStyle}
        onChange={onChange}
        onChangeText={onChangeText}
        autoFocus={autoFocus}
        selectTextOnFocus={true}
        placeholderTextColor={colors.neutralLightest}
        editable={editable}
        multiline={multiline}
        {...props}
      />
    </InputContainer>
  );
};

Input.defaultProps = {
  onChange: () => {},
  onChangeText: () => {},
  title: '',
  autoFocus: false,
  horizontal: false,
  stacked: false,
  customStyle: CUSTOM_STYLE,
  lateFocus: false,
  editable: true,
};

export default Input;

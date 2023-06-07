import {Objects} from '@openforis/arena-core';
import React, {useMemo, useRef, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {Platform} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';

import * as colors from 'arena-mobile-ui/colors';

import Icon from '../Icon';

import styles from './styles';

const ChevronIcon = () => <Icon name="chevron-down" />;

const _keyStractor = item => item?.uuid || item?.id || item;
const _labelStractor = item => item.name || item;
const _prepareItemFn =
  ({keyStractor, labelStractor, selectedItemKey}) =>
  item => {
    return Object.assign({}, typeof item === 'object' ? item : {}, {
      key: keyStractor(item),
      value: item,
      label: labelStractor(item),
      color:
        Platform.OS === 'ios'
          ? null
          : selectedItemKey === keyStractor(item)
          ? colors.neutralLighter
          : colors.secondary,
    });
  };
const _filterFn = () => true;

const Select = ({
  items,
  customStyles,
  selectedItemKey,
  onValueChange,
  keyStractor = _keyStractor,
  labelStractor = _labelStractor,
  prepareItemFn = _prepareItemFn,
  filterFn = _filterFn,
  doneText = 'ok',
  autoFocus = false,
  disabled = false,
}) => {
  const {t} = useTranslation();
  const selectRef = useRef(null);

  const _items = useMemo(
    () =>
      Objects.isEmpty(items)
        ? []
        : items
            .filter(filterFn)
            .map(prepareItemFn({keyStractor, labelStractor, selectedItemKey})),
    [
      items,
      keyStractor,
      labelStractor,
      prepareItemFn,
      filterFn,
      selectedItemKey,
    ],
  );

  useEffect(() => {
    if (autoFocus) {
      selectRef.current.togglePicker();
    }
  }, [autoFocus, selectRef]);

  const _styles = useMemo(() => {
    return Objects.isEmpty(customStyles)
      ? styles
      : Object.assign({}, styles, {
          inputIOS: Object.assign({}, styles.inputIOS, customStyles.inputIOS),
          inputAndroid: Object.assign(
            {},
            styles.inputAndroid,
            customStyles.inputAndroid,
          ),
        });
  }, [customStyles]);

  return (
    <RNPickerSelect
      ref={selectRef}
      style={_styles}
      onValueChange={onValueChange}
      items={_items}
      itemKey={selectedItemKey}
      Icon={ChevronIcon}
      doneText={doneText}
      disabled={disabled}
      useNativeAndroidPickerStyle={false}
      fixAndroidTouchableBug={true}
      placeholder={{
        label: t('Common:select_an_item'),
        value: null,
        color: colors.neutralLighter,
      }}
    />
  );
};

export default Select;

import {Objects} from '@openforis/arena-core';
import React, {useMemo, useRef, useEffect} from 'react';
import RNPickerSelect from 'react-native-picker-select';

import Icon from '../Icon';

import styles from './styles';

const ChevronIcon = () => <Icon name="chevron-down" />;

const _keyStractor = item => item?.uuid || item?.id || item;
const _labelStractor = item => item.name || item;
const _prepareItemFn =
  ({keyStractor, labelStractor}) =>
  item => {
    return Object.assign({}, typeof item === 'object' ? item : {}, {
      key: keyStractor(item),
      value: item,
      label: labelStractor(item),
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
  const selectRef = useRef(null);

  const _items = useMemo(
    () =>
      Objects.isEmpty(items)
        ? []
        : items
            .filter(filterFn)
            .map(prepareItemFn({keyStractor, labelStractor})),
    [items, keyStractor, labelStractor, prepareItemFn, filterFn],
  );

  useEffect(() => {
    if (autoFocus) {
      selectRef.current.togglePicker();
    }
  }, [autoFocus, selectRef]);

  const _styles = useMemo(
    () =>
      Objects.isEmpty(customStyles)
        ? styles
        : Object.assign({}, styles, {
            inputIOS: Object.assign({}, styles.inputIOS, customStyles),
            inputAndroid: Object.assign({}, styles.inputAndroid, customStyles),
          }),
    [customStyles],
  );

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
    />
  );
};

export default Select;

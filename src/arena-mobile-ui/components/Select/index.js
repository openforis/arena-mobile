import React, {useMemo, useRef, useEffect} from 'react';
import RNPickerSelect from 'react-native-picker-select';

import Icon from '../Icon';

import styles from './styles';

const ChevronIcon = () => <Icon name="chevron-down-outline" />;

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
  items = [],
  customStyles = {},
  selectedItemKey,
  onValueChange,
  keyStractor = _keyStractor,
  labelStractor = _labelStractor,
  prepareItemFn = _prepareItemFn,
  filterFn = _filterFn,
  doneText = null,
  autoFocus = false,
}) => {
  const selectRef = useRef(null);

  const _items = useMemo(
    () =>
      items.filter(filterFn).map(prepareItemFn({keyStractor, labelStractor})),
    [items, keyStractor, labelStractor, prepareItemFn, filterFn],
  );

  useEffect(() => {
    if (autoFocus) {
      selectRef.current.togglePicker();
    }
  }, [autoFocus, selectRef]);

  return (
    <RNPickerSelect
      ref={selectRef}
      style={{
        ...styles({customStyles}),
      }}
      onValueChange={onValueChange}
      items={_items}
      itemKey={selectedItemKey}
      Icon={ChevronIcon}
      doneText={doneText}
    />
  );
};

export default Select;

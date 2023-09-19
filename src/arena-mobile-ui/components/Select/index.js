import React, {useMemo, useRef, useEffect} from 'react';
import {Platform} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import {useSelector} from 'react-redux';

import * as colors from 'arena-mobile-ui/colors';
import {Objects} from 'infra/objectUtils';
import appSelectors from 'state/app/selectors';

import Icon from '../Icon';

import styles from './styles';

const ChevronIcon = () => <Icon name="chevron-down" />;

const _keyExtractor = item => item?.uuid || item?.id || item;
const _labelExtractor = item => item.name || item;
const _prepareItemFn =
  ({keyExtractor, labelExtractor, selectedItemKey}) =>
  item => {
    return {
      ...(typeof item === 'object' ? item : {}),
      key: keyExtractor(item),
      value: item,
      label: labelExtractor(item),
      ...(Platform.OS !== 'ios'
        ? {
            color:
              selectedItemKey === keyExtractor(item)
                ? colors.secondary
                : colors.neutralLighter,
          }
        : {}),
    };
  };
const _filterFn = () => true;

const Select = ({
  items,
  customStyles,
  selectedItemKey,
  onValueChange,
  keyExtractor,
  labelExtractor,
  prepareItemFn,
  filterFn,
  doneText,
  autoFocus,
  disabled,
}) => {
  const colorScheme = useSelector(appSelectors.getColorScheme);
  const selectRef = useRef(null);

  const _items = useMemo(
    () =>
      Objects.isEmpty(items)
        ? []
        : items
            .filter(filterFn)
            .map(
              prepareItemFn({keyExtractor, labelExtractor, selectedItemKey}),
            ),
    [
      items,
      keyExtractor,
      labelExtractor,
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
      : {
          ...styles,
          inputIOS: {
            ...(styles.inputIOS || {}),
            ...(customStyles?.inputIOS || {}),
          },
          inputAndroid: {
            ...(styles.inputAndroid || {}),
            ...(customStyles?.inputAndroid || {}),
          },
        };
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
      placeholder={{}}
      darkTheme={colorScheme === 'dark'}
    />
  );
};

Select.defaultProps = {
  items: [],
  customStyles: {},
  selectedItemKey: null,
  onValueChange: () => {},
  keyExtractor: _keyExtractor,
  labelExtractor: _labelExtractor,
  prepareItemFn: _prepareItemFn,
  filterFn: _filterFn,
  doneText: 'ok',
  autoFocus: false,
  disabled: false,
};

export default Select;

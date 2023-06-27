import React, {useCallback, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet} from 'react-native';
import {useSelector} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import ChevronDown from 'form/Attributes/common/SearchableForm/ChevronDown';
import {selectors as formSelectors} from 'state/form';
import {useSelectNodeAndNodeDef} from 'state/form/hooks/useNodeFormActions';

import {useCode} from '../../hooks';

import styles from './styles';

const CodeNodeDropdown = ({nodeDef, node}) => {
  const {t} = useTranslation();
  const {categoryItems, getCategoryItemLabel} = useCode({
    nodeDef,
    node,
  });

  const disabled = useSelector(state =>
    formSelectors.isNodeDefDisabled(state, nodeDef),
  );

  const _disabled = disabled || categoryItems.length === 0;

  const selectedItem = useMemo(
    () => categoryItems.find(item => item.uuid === node?.value?.itemUuid),
    [categoryItems, node],
  );

  const _labelStractor = useCallback(
    item => getCategoryItemLabel(item),
    [getCategoryItemLabel],
  );

  const handleSelectNodeAndNodeDef = useSelectNodeAndNodeDef({
    node,
    nodeDef,
  });

  const customTextStyle = useMemo(
    () => StyleSheet.compose(styles.text, selectedItem ? styles.selected : {}),
    [selectedItem],
  );

  const customContainerStyle = useMemo(
    () =>
      StyleSheet.compose(
        styles.containerStyle,
        _disabled ? styles.disabled : {},
      ),
    [_disabled],
  );

  return (
    <Button
      onPress={handleSelectNodeAndNodeDef}
      type="secondary"
      iconPosition="right"
      label={
        selectedItem ? _labelStractor(selectedItem) : t('Form:select_empty')
      }
      icon={ChevronDown}
      customTextStyle={customTextStyle}
      disabled={_disabled}
      customContainerStyle={customContainerStyle}
    />
  );
};

export default CodeNodeDropdown;

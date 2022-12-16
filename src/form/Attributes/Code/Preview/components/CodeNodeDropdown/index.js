import React, {useCallback, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import ChevronDown from 'form/Attributes/common/SearchableForm/ChevronDown';
import {selectors as formSelectors, actions as formActions} from 'state/form';

import {useCode} from '../../hooks';

import styles from './styles';

const CodeNodeDropdown = ({nodeDef, node}) => {
  const {t} = useTranslation();
  const {categoryItems, getCategoryItemLabel} = useCode({
    nodeDef,
    node,
  });
  const applicable = useSelector(state =>
    formSelectors.isNodeDefApplicable(state, nodeDef?.uuid),
  );

  const selectedItem = useMemo(
    () => categoryItems.find(item => item.uuid === node?.value?.itemUuid),
    [categoryItems, node],
  );

  const _labelStractor = useCallback(
    item => getCategoryItemLabel(item),
    [getCategoryItemLabel],
  );

  const dispatch = useDispatch();

  const handleSelectNodeAndNodeDef = useCallback(() => {
    dispatch(formActions.setNode({node: node}));
  }, [dispatch, node]);

  const disabled = !applicable || categoryItems.length === 0;
  return (
    <Button
      onPress={handleSelectNodeAndNodeDef}
      type="secondary"
      iconPosition="right"
      label={
        selectedItem ? _labelStractor(selectedItem) : t('Form:select_empty')
      }
      icon={ChevronDown}
      customTextStyle={[styles.text, selectedItem ? styles.selected : {}]}
      disabled={disabled}
      customContainerStyle={disabled ? styles.disabled : {}}
    />
  );
};

export default CodeNodeDropdown;

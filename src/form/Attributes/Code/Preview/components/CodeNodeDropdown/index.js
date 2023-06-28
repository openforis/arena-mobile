import React, {useCallback, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';

import DropDownButton from 'arena-mobile-ui/components/Button/DropDownButton';
import {selectors as formSelectors} from 'state/form';
import {useSelectNodeAndNodeDef} from 'state/form/hooks/useNodeFormActions';

import {useCode} from '../../hooks';

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

  return (
    <DropDownButton
      onPress={handleSelectNodeAndNodeDef}
      label={
        selectedItem ? _labelStractor(selectedItem) : t('Form:select_empty')
      }
      disabled={_disabled}
      selected={selectedItem}
    />
  );
};

export default CodeNodeDropdown;

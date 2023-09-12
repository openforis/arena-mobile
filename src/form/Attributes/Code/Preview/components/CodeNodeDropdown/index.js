import {NodeDefs, Objects} from '@openforis/arena-core';
import React, {useCallback, useEffect, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';

import DropDownButton from 'arena-mobile-ui/components/Button/DropDownButton';
import {selectors as formSelectors} from 'state/form';
import {
  useSelectNodeAndNodeDef,
  useCleanNode,
} from 'state/form/hooks/useNodeFormActions';

import {useCode} from '../../hooks';

const CodeNodeDropdown = ({nodeDef, node}) => {
  const {t} = useTranslation();
  const {categoryItems, getCategoryItemLabel} = useCode({
    nodeDef,
    node,
  });

  const handleClean = useCleanNode();
  const disabled = useSelector(state =>
    formSelectors.isNodeDefDisabled(state, nodeDef),
  );

  const parentEntityNodeDef = useSelector(state =>
    formSelectors.getParentEntityNodeDef(state, nodeDef),
  );

  const _disabled =
    disabled ||
    categoryItems?.length === 0 ||
    NodeDefs.isEnumerate(parentEntityNodeDef);

  const selectedItem = useMemo(() => {
    if (node?.value?.itemUuid) {
      return categoryItems?.find(item => item.uuid === node?.value?.itemUuid);
    }
    return false;
  }, [categoryItems, node?.value?.itemUuid]);

  const _labelExtractor = useCallback(
    item => getCategoryItemLabel(item),
    [getCategoryItemLabel],
  );

  const handleSelectNodeAndNodeDef = useSelectNodeAndNodeDef({
    node,
    nodeDef,
  });

  useEffect(() => {
    if (Objects.isEmpty(selectedItem) && !Objects.isEmpty(node?.value)) {
      handleClean({node, value: {}});
    }
  }, [selectedItem, node?.value, handleClean, node]);

  return (
    <DropDownButton
      onPress={handleSelectNodeAndNodeDef}
      label={
        selectedItem ? _labelExtractor(selectedItem) : t('Form:select_empty')
      }
      disabled={_disabled}
      selected={selectedItem}
    />
  );
};

export default CodeNodeDropdown;

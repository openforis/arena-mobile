import React, {useCallback} from 'react';
import {useSelector} from 'react-redux';

import Select from 'arena-mobile-ui/components/Select';
import {selectors as formSelectors} from 'state/form';
import useNodeFormActions from 'state/form/hooks/useNodeFormActions';

import {useCode} from '../../hooks';

const CodeNodeDropdown = ({nodeDef, node}) => {
  const {language, categoryItems, getCategoryItemLabel} = useCode({
    nodeDef,
    node,
  });

  const {handleUpdate, handleCreate} = useNodeFormActions({nodeDef});

  const applicable = useSelector(state =>
    formSelectors.isNodeDefApplicable(state, nodeDef?.uuid),
  );

  const handleSelect = useCallback(
    categoryItem => {
      let newValue = {itemUuid: categoryItem?.uuid};
      if (node?.uuid) {
        handleUpdate({node, value: newValue});
      } else {
        handleCreate({value: newValue});
      }
    },
    [handleUpdate, handleCreate, node],
  );

  const _labelStractor = useCallback(
    item => getCategoryItemLabel({categoryItem: item, language}),
    [getCategoryItemLabel, language],
  );

  return (
    <Select
      key={node?.value?.itemUuid}
      items={categoryItems}
      labelStractor={_labelStractor}
      onValueChange={handleSelect}
      selectedItemKey={node?.value?.itemUuid}
      disabled={!applicable}
    />
  );
};

export default CodeNodeDropdown;

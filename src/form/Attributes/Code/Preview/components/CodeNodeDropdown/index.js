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

  const codeActions = useNodeFormActions({nodeDef});

  const applicable = useSelector(state =>
    formSelectors.isNodeDefApplicable(state, nodeDef?.uuid),
  );

  const handleSelect = useCallback(
    categoryItem => {
      let newValue = {itemUuid: categoryItem?.uuid};
      if (node?.uuid) {
        codeActions.handleUpdate({node, value: newValue});
      } else {
        codeActions.handleCreate({value: newValue});
      }
    },
    [codeActions, node],
  );

  return (
    <Select
      key={node?.value?.itemUuid}
      items={categoryItems}
      labelStractor={item =>
        getCategoryItemLabel({categoryItem: item, language})
      }
      onValueChange={handleSelect}
      selectedItemKey={node?.value?.itemUuid}
      disabled={!applicable}
    />
  );
};

export default CodeNodeDropdown;

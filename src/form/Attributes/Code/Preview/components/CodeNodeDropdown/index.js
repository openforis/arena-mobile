import React, {useCallback} from 'react';

import Select from 'arena-mobile-ui/components/Select';

import {useCode} from '../../hooks';

const CodeNodeDropdown = ({nodeDef, node}) => {
  const {codeActions, language, categoryItems, getCategoryItemLabel} = useCode({
    nodeDef,
    node,
  });

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
    />
  );
};

export default CodeNodeDropdown;

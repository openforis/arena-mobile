import React, {useCallback} from 'react';

import Select from 'arena-mobile-ui/components/Select';

import {useCode} from '../../hooks';

const CodeNodeDropdown = ({nodeDef, node}) => {
  const {codeActions, language, categoryItems, getCategoryItemLabel} = useCode({
    nodeDef,
  });

  const handleSelect = useCallback(
    categoryItem => {
      let newValue = {itemUuid: categoryItem?.uuid};
      codeActions.handleUpdate({node, value: newValue});
    },
    [codeActions, node],
  );

  return (
    <Select
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

import React, {useCallback} from 'react';

import Select from 'arena-mobile-ui/components/Select';

import ChipContainer from '../../components/ChipsContainer';
import OptionChip from '../../components/OptionChip';
import {useCode} from '../../hooks';

const CodeDropdownMultiple = ({nodeDef}) => {
  const {language, nodes, categoryItems, getCategoryItemLabel, codeActions} =
    useCode({
      nodeDef,
    });

  const handleSelect = useCallback(
    categoryItem => {
      if (categoryItem) {
        let newValue = {itemUuid: categoryItem.uuid};
        codeActions.handleCreate({value: newValue});
      }
    },
    [codeActions],
  );

  const handleDelete = useCallback(
    ({node}) =>
      () => {
        codeActions.handleDelete({node});
      },
    [codeActions],
  );

  if (!(categoryItems.length > 0)) {
    return null;
  }

  return (
    <>
      <ChipContainer>
        {nodes
          .filter(node => node?.value?.itemUuid)
          .map(node => (
            <OptionChip
              key={node.uuid}
              label={getCategoryItemLabel({
                categoryItem: categoryItems.find(
                  _categoryItem => _categoryItem.uuid === node?.value?.itemUuid,
                ),
                language,
              })}
              iconName="close"
              onPressIcon={handleDelete({node})}
            />
          ))}
      </ChipContainer>

      {nodes.length !== categoryItems.length && (
        <Select
          items={categoryItems}
          labelStractor={item =>
            getCategoryItemLabel({categoryItem: item, language})
          }
          filterFn={item =>
            nodes.length > 0
              ? !nodes.some(node => node?.value?.itemUuid === item.uuid)
              : true
          }
          onValueChange={handleSelect}
          value={null}
        />
      )}
    </>
  );
};

export default CodeDropdownMultiple;

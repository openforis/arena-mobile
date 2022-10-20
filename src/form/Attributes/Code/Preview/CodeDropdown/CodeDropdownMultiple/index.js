import React, {useCallback} from 'react';
import {useSelector} from 'react-redux';

import Select from 'arena-mobile-ui/components/Select';
import {selectors as formSelectors} from 'state/form';
import useNodeFormActions from 'state/form/hooks/useNodeFormActions';

import ChipContainer from '../../components/ChipsContainer';
import OptionChip from '../../components/OptionChip';
import {useCode} from '../../hooks';

const CodeDropdownMultiple = ({nodeDef}) => {
  const {language, nodes, categoryItems, getCategoryItemLabel} = useCode({
    nodeDef,
  });

  const applicable = useSelector(state =>
    formSelectors.isNodeDefApplicable(state, nodeDef?.uuid),
  );

  const codeActions = useNodeFormActions({nodeDef});

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
    ({node, label}) =>
      () => {
        if (applicable) {
          codeActions.handleDelete({node, label});
        }
      },
    [codeActions, applicable],
  );

  if (categoryItems.length <= 0) {
    return null;
  }

  return (
    <>
      <ChipContainer>
        {nodes
          .filter(node => node?.value?.itemUuid)
          .map(node => {
            const label = getCategoryItemLabel({
              categoryItem: categoryItems.find(
                _categoryItem => _categoryItem.uuid === node?.value?.itemUuid,
              ),
              language,
            });
            return (
              <OptionChip
                key={node.uuid}
                label={label}
                iconName="close"
                onPressIcon={handleDelete({node, label})}
              />
            );
          })}
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
          disabled={!applicable}
        />
      )}
    </>
  );
};

export default CodeDropdownMultiple;

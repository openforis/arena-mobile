import React, {useEffect, useCallback, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';

import DropDownButton from 'arena-mobile-ui/components/Button/DropDownButton';
import {selectors as formSelectors} from 'state/form';
import useNodeFormActions, {
  useSelectNodeAndNodeDef,
} from 'state/form/hooks/useNodeFormActions';

import ChipContainer from '../../components/ChipsContainer';
import OptionChip from '../../components/OptionChip';
import {useCode} from '../../hooks';

const CodeDropdownMultiple = ({nodeDef}) => {
  const {t} = useTranslation();

  const {nodes, categoryItems, getCategoryItemLabel} = useCode(nodeDef);

  const disabled = useSelector(state =>
    formSelectors.isNodeDefDisabled(state, nodeDef),
  );

  const codeActions = useNodeFormActions({nodeDef});

  const handleSelectNodeAndNodeDef = useSelectNodeAndNodeDef({
    node: nodes?.[0],
    nodeDef,
  });

  useEffect(() => {
    if (nodes.length === 0) {
      codeActions.handleCreate({value: null});
    }
  }, [nodes, codeActions]);

  const handleDelete = useCallback(
    ({node, label}) =>
      () => {
        if (!disabled) {
          codeActions.handleDelete({node, label, requestConfirm: false});
        }
      },
    [codeActions, disabled],
  );

  const _labelExtractor = useCallback(
    item => getCategoryItemLabel(item),
    [getCategoryItemLabel],
  );

  const _nodesToShow = useMemo(() => {
    const _nodes = [];
    const _nodesToDelete = [];
    for (const node of nodes) {
      if (node?.value?.itemUuid) {
        const categoryItem = categoryItems.find(
          _categoryItem => _categoryItem.uuid === node?.value?.itemUuid,
        );
        if (!categoryItem) {
          _nodesToDelete.push(node);
        } else {
          _nodes.push({node, label: _labelExtractor(categoryItem)});
        }
      }
    }

    // This is to delete nodes when hiearchical parent changes
    if (_nodesToDelete.length > 0) {
      for (const node of _nodesToDelete) {
        codeActions.handleDelete({node, requestConfirm: false});
      }
    }

    return _nodes;
  }, [nodes, categoryItems, codeActions]);

  if (categoryItems.length === 0) {
    return null;
  }

  return (
    <>
      <ChipContainer>
        {_nodesToShow.map(({node, label}) => (
          <OptionChip
            key={node.uuid}
            label={label}
            iconName="close"
            onPressIcon={handleDelete({node, label})}
          />
        ))}
      </ChipContainer>

      {_nodesToShow.length !== categoryItems.length && (
        <DropDownButton
          onPress={handleSelectNodeAndNodeDef}
          label={t('Form:select_empty')}
          disabled={disabled}
        />
      )}
    </>
  );
};

export default CodeDropdownMultiple;

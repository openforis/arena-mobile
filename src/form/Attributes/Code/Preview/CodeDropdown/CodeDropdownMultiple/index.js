import React, {useEffect, useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import ChevronDown from 'form/Attributes/common/SearchableForm/ChevronDown';
import {selectors as formSelectors} from 'state/form';
import useNodeFormActions, {
  useSelectNodeAndNodeDef,
} from 'state/form/hooks/useNodeFormActions';

import ChipContainer from '../../components/ChipsContainer';
import OptionChip from '../../components/OptionChip';
import {useCode} from '../../hooks';

import styles from './styles';

const CodeDropdownMultiple = ({nodeDef}) => {
  const {t} = useTranslation();

  const {nodes, categoryItems, getCategoryItemLabel} = useCode({
    nodeDef,
  });

  const disabled = useSelector(state =>
    formSelectors.isNodeDefDisabled(state, nodeDef),
  );

  const codeActions = useNodeFormActions({nodeDef});

  const handleSelectNodeAndNodeDef = useSelectNodeAndNodeDef({
    node: nodes[0],
    nodeDef,
  });

  useEffect(() => {
    if (nodes.length <= 0) {
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

  const _labelStractor = useCallback(
    item => getCategoryItemLabel(item),
    [getCategoryItemLabel],
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
            const categoryItem = categoryItems.find(
              _categoryItem => _categoryItem.uuid === node?.value?.itemUuid,
            );

            const label = _labelStractor(categoryItem);

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
        <Button
          onPress={handleSelectNodeAndNodeDef}
          type="secondary"
          iconPosition="right"
          label={t('Form:select_empty')}
          icon={ChevronDown}
          customContainerStyle={styles.container}
          customTextStyle={styles.text}
          disabled={disabled}
        />
      )}
    </>
  );
};

export default CodeDropdownMultiple;

import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import Icon from 'arena-mobile-ui/components/Icon';
import {selectors as formSelectors, actions as formActions} from 'state/form';
import useNodeFormActions from 'state/form/hooks/useNodeFormActions';

import ChipContainer from '../../components/ChipsContainer';
import OptionChip from '../../components/OptionChip';
import {useCode} from '../../hooks';

const ChevronDown = <Icon name="chevron-down" />;
import styles from './styles';

const CodeDropdownMultiple = ({nodeDef}) => {
  const {t} = useTranslation();
  const dispatch = useDispatch();

  const {nodes, categoryItems, getCategoryItemLabel} = useCode({
    nodeDef,
  });

  const applicable = useSelector(state =>
    formSelectors.isNodeDefApplicable(state, nodeDef?.uuid),
  );

  const codeActions = useNodeFormActions({nodeDef});

  const handleSelectNodeAndNodeDef = useCallback(() => {
    dispatch(formActions.setNode({node: nodes[0]}));
  }, [dispatch, nodes]);

  const handleDelete = useCallback(
    ({node, label}) =>
      () => {
        if (applicable) {
          codeActions.handleDelete({node, label});
        }
      },
    [codeActions, applicable],
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
          disabled={!applicable}
        />
      )}
    </>
  );
};

export default CodeDropdownMultiple;

import {NodeDefs} from '@openforis/arena-core';
import React, {useMemo, useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {TouchableOpacity} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import TextBase from 'arena-mobile-ui/components/Texts/TextBase';
import useNodeDefNameOrLabel from 'arena-mobile-ui/hooks/useNodeDefNameOrLabel';
import {selectors as formSelectors, actions as formActions} from 'state/form';
import {selectors as surveySelectors} from 'state/survey';

import styles from './styles';

const Entity = ({nodeDef, isCurrentEntity = false}) => {
  const {t} = useTranslation();
  const nodeDefName = useNodeDefNameOrLabel({nodeDef});
  const cycle = useSelector(surveySelectors.getSurveyCycle);
  const dispatch = useDispatch();

  const hierarchyNodeDefUuids = useSelector(
    formSelectors.getHierarchyNodeDefUuids,
  );

  const handleSelect = useCallback(() => {
    dispatch(
      formActions.selectEntity({
        nodeDef,
      }),
    );
  }, [nodeDef, dispatch]);

  const isDisabled = useMemo(
    () =>
      nodeDef.parentUuid && !hierarchyNodeDefUuids.includes(nodeDef.parentUuid),
    [nodeDef, hierarchyNodeDefUuids],
  );
  return (
    <TouchableOpacity
      style={[styles.container, isCurrentEntity ? styles.activeContainer : {}]}
      disabled={isDisabled}
      onPress={handleSelect}
      hitSlop={{top: 10, bottom: 10}}>
      <TextBase
        customStyle={[
          styles.text,
          isDisabled ? styles.textDisabled : {},
          isCurrentEntity ? styles.active : {},
        ]}>
        {nodeDefName}
        {NodeDefs.getLayoutRenderTypePerCycle({nodeDef, cycle}) === 'table'
          ? t('Form:nodeDefEntity.layout.table')
          : ''}
      </TextBase>
    </TouchableOpacity>
  );
};

export default Entity;

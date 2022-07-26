import {NodeDefs} from '@openforis/arena-core';
import React, {useMemo, useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {Text, TouchableOpacity} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import useNodeDefNameOrLabel from 'arena-mobile-ui/hooks/useNodeDefNameOrLabel';
import {selectors as formSelectors, actions as formActions} from 'state/form';
import {selectors as surveySelectors} from 'state/survey';

import styles from './styles';

NodeDefs.getLayoutRenderTypePerCycle = ({nodeDef, cycle = 0}) =>
  nodeDef?.props?.layout?.[cycle]?.renderType;

const Entity = ({nodeDef}) => {
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
      style={[styles.container]}
      disabled={isDisabled}
      onPress={handleSelect}
      hitSlop={{top: 10, bottom: 10}}>
      <Text style={[styles.text, isDisabled ? styles.textDisabled : {}]}>
        {nodeDefName}
        {NodeDefs.getLayoutRenderTypePerCycle({nodeDef, cycle}) === 'table'
          ? t('Form:nodeDefEntity.layout.table')
          : ''}
      </Text>
    </TouchableOpacity>
  );
};

export default Entity;

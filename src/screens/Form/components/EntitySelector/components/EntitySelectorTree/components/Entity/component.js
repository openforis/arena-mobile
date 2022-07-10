import React, {useMemo, useCallback} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import useNodeDefNameOrLabel from 'arena-mobile-ui/hooks/useNodeDefNameOrLabel';
import {selectors as formSelectors, actions as formActions} from 'state/form';

import styles from './styles';

const Entity = ({nodeDef, level, hasChildren}) => {
  const nodeDefName = useNodeDefNameOrLabel({nodeDef});
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
      </Text>
    </TouchableOpacity>
  );
};

export default Entity;

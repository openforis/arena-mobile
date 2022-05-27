import React, {useMemo} from 'react';
import {Text, TouchableOpacity} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import useNodeDefNameOrLabel from 'arena-mobile-ui/hooks/useNodeDefNameOrLabel';
import {selectors as formSelectors, actions as formActions} from 'state/form';

import styles from './styles';

const Entity = ({nodeDef}) => {
  const hierarchyNodeDefUuuids = useSelector(
    formSelectors.getHierarchyNodeDefUuids,
  );
  const nodeDefName = useNodeDefNameOrLabel({nodeDef});

  const dispatch = useDispatch();

  const handleSelect = React.useCallback(() => {
    dispatch(
      formActions.selectEntity({
        nodeDef,
      }),
    );
  }, [nodeDef, dispatch]);

  const isDisabled = useMemo(
    () =>
      nodeDef.parentUuid &&
      !hierarchyNodeDefUuuids.includes(nodeDef.parentUuid),
    [nodeDef, hierarchyNodeDefUuuids],
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

import {NodeDefs} from '@openforis/arena-core';
import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import Select from 'arena-mobile-ui/components/Select';
import {uuidv4} from 'infra/uuid';
import {selectors as formSelectors, actions as formActions} from 'state/form';

import styles, {pickerSelectStyles, pickerSelectStylesNeutral} from './styles';

export const EntityNodeSelector = ({theme = null} = {}) => {
  const [key, setKey] = useState(uuidv4());

  const parentEntityNodeDef = useSelector(formSelectors.getParentEntityNodeDef);
  const parentEntityNode = useSelector(formSelectors.getParentEntityNode);

  const siblingNodesInhierarchy = useSelector(state =>
    formSelectors.getNodeDefNodesWithKeysAsStringInHierarchy(
      state,
      parentEntityNodeDef,
    ),
  );

  useEffect(() => {
    setKey(uuidv4());
  }, [siblingNodesInhierarchy]);

  const dispatch = useDispatch();

  const handleSelectEntityNode = useCallback(
    node => {
      if (node) {
        dispatch(
          formActions.selectEntityNode({
            node,
          }),
        );
      } else {
        setKey(uuidv4());
      }
    },
    [dispatch],
  );

  const _labelStractor = useCallback(item => item?.keyString || '-', []);

  if (!NodeDefs.isMultiple(parentEntityNodeDef)) {
    return <></>;
  }

  return (
    <View style={styles.container}>
      <Select
        key={key}
        items={siblingNodesInhierarchy}
        customStyles={
          theme === 'neutral' ? pickerSelectStylesNeutral : pickerSelectStyles
        }
        onValueChange={handleSelectEntityNode}
        selectedItemKey={parentEntityNode.uuid}
        labelStractor={_labelStractor}
      />
    </View>
  );
};

export default EntityNodeSelector;

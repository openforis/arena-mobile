import {NodeDefs} from '@openforis/arena-core';
import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import Select from 'arena-mobile-ui/components/Select';
import {uuidv4} from 'infra/uuid';
import {selectors as formSelectors, actions as formActions} from 'state/form';

import styles, {pickerSelectStyles, pickerSelectStylesNeutral} from './styles';

const EntityNodeSelector = ({
  theme = null,
  parentNodeDef = false,
  parentNode = false,
} = {}) => {
  const [key, setKey] = useState(uuidv4());

  const parentEntityNodeDef = useSelector(formSelectors.getParentEntityNodeDef);
  const _parentEntityNodeDef = parentNodeDef || parentEntityNodeDef;
  const parentEntityNode = useSelector(formSelectors.getParentEntityNode);
  const _parentEntityNode = parentNode || parentEntityNode;

  const siblingNodesInhierarchy = useSelector(state =>
    formSelectors.getNodeDefNodesWithKeysAsStringInHierarchy(
      state,
      _parentEntityNodeDef,
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

  return (
    <View style={styles.container}>
      <Select
        key={key}
        items={siblingNodesInhierarchy}
        customStyles={
          theme === 'neutral' ? pickerSelectStylesNeutral : pickerSelectStyles
        }
        onValueChange={handleSelectEntityNode}
        selectedItemKey={_parentEntityNode.uuid}
        labelStractor={_labelStractor}
      />
    </View>
  );
};

const EntityNodeSelectorWrapper = ({
  theme = null,
  parentNodeDef = false,
  parentNode = false,
} = {}) => {
  const parentEntityNodeDef = useSelector(formSelectors.getParentEntityNodeDef);
  const _parentEntityNodeDef = parentNodeDef || parentEntityNodeDef;

  if (!NodeDefs.isMultiple(_parentEntityNodeDef)) {
    return <></>;
  }

  return (
    <EntityNodeSelector
      theme={theme}
      parentNodeDef={parentNodeDef}
      parentNode={parentNode}
    />
  );
};

export default EntityNodeSelectorWrapper;

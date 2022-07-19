import {NodeDefs} from '@openforis/arena-core';
import React from 'react';
import {View} from 'react-native';
import {useSelector} from 'react-redux';

import AttributeHeader from 'form/common/Header';
import {selectors as formSelectors} from 'state/form';

import CodeDropdownMultiple from './CodeDropdownMultiple';
import CodeDropdownSingle from './CodeDropdownSingle';
import styles from './styles';

const CodeDropdown = ({nodeDef}) => {
  const nodes = useSelector(state =>
    formSelectors.getNodeDefNodesInHierarchy(state, nodeDef),
  );

  return (
    <View style={styles.container}>
      <AttributeHeader nodeDef={nodeDef} nodes={nodes} />
      {NodeDefs.isMultiple(nodeDef) ? (
        <CodeDropdownMultiple nodeDef={nodeDef} />
      ) : (
        <CodeDropdownSingle nodeDef={nodeDef} />
      )}
    </View>
  );
};

export default CodeDropdown;

/*const useIsActive = ({node, nodeDef}) => {
  const parentCodeNode = useSelector(state =>
    surveySelectors.getParentCodeNode(state, nodeDef, node),
  );

  return parentCodeNode === false || parentCodeNode?.value?.itemUuid;
};*/

import React from 'react';
import {Text, ScrollView, View} from 'react-native';
import {useSelector} from 'react-redux';

import Label from 'form/common/Label';
import {selectors as formSelectors} from 'state/form';
import {selectors as surveySelectors} from 'state/survey';

const Attribute = ({nodeDefUuid}) => <Text>{nodeDefUuid}</Text>;

import styles from './styles';
const Attributes = () => {
  const nodeDef = useSelector(formSelectors.getParentEntityNodeDef);
  const node = useSelector(formSelectors.getParentEntityNode);
  const nodeDefChildrenUuids = useSelector(state =>
    surveySelectors.getNodeDefEntityChildrenAttributesUuids(state, nodeDef),
  );

  return (
    <ScrollView style={styles.container}>
      <Label nodeDef={nodeDef} />
      <Text>{node.uuid}</Text>
      {nodeDefChildrenUuids?.map(childrenUuid => (
        <Attribute key={childrenUuid} nodeDefUuid={childrenUuid} />
      ))}
      <View style={{height: 100}} />
    </ScrollView>
  );
};

export default Attributes;

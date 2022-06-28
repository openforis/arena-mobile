import React from 'react';
import {ScrollView, View} from 'react-native';
import {useSelector} from 'react-redux';

import Attribute from 'form/common/Attribute';
import {selectors as formSelectors} from 'state/form';
import {selectors as surveySelectors} from 'state/survey';

import styles from './styles';
const Attributes = () => {
  const nodeDef = useSelector(formSelectors.getParentEntityNodeDef);
  const nodeDefChildrenUuids = useSelector(state =>
    surveySelectors.getNodeDefEntityChildrenAttributesUuids(state, nodeDef),
  );

  return (
    <ScrollView style={styles.container}>
      {nodeDefChildrenUuids?.map(childrenUuid => (
        <Attribute key={childrenUuid} nodeDefUuid={childrenUuid} />
      ))}
      <View style={{height: 100}} />
    </ScrollView>
  );
};

export default Attributes;

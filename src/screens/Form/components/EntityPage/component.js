import React from 'react';
import {View} from 'react-native';
import {useSelector} from 'react-redux';

import {selectors as formSelectors} from 'state/form';

import Entity from './components/Entity';

const EntityPage = () => {
  const nodeDef = useSelector(formSelectors.getParentEntityNodeDef);

  if (nodeDef?.type === 'entity') {
    return <Entity />;
  }
  return <View />;
};

export default EntityPage;

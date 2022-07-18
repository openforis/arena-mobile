import {NodeDefs} from '@openforis/arena-core';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import {useSelector} from 'react-redux';

import {selectors as formSelectors} from 'state/form';

import Entity from './components/Entity';
import TableEntity from './components/TableEntity';

NodeDefs.getLayoutRenderTypePerCycle = ({nodeDef, cycle = 0}) =>
  nodeDef.props.layout[cycle].renderType;

const EntityPage = () => {
  const nodeDef = useSelector(formSelectors.getParentEntityNodeDef);
  const isTable = useMemo(
    () => NodeDefs.getLayoutRenderTypePerCycle({nodeDef}) === 'table',
    [nodeDef],
  );

  if (NodeDefs.isEntity(nodeDef)) {
    return isTable ? <TableEntity /> : <Entity />;
  }
  return <View />;
};

export default EntityPage;

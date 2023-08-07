import {NodeDefs} from '@openforis/arena-core';
import React, {useMemo} from 'react';
import {View} from 'react-native';
import {useSelector} from 'react-redux';

import {selectors as formSelectors} from 'state/form';
import {selectors as surveySelectors} from 'state/survey';

import Entity from './components/Entity';
import TableEntity from './components/TableEntity';

const EntityPage = () => {
  const nodeDef = useSelector(formSelectors.getParentEntityNodeDef);
  const cycle = useSelector(surveySelectors.getSurveyCycle);
  const isTable = useMemo(
    () => NodeDefs.getLayoutRenderType(cycle)(nodeDef) === 'table',
    [nodeDef, cycle],
  );
  const isMultiple = useMemo(() => NodeDefs.isMultiple(nodeDef), [nodeDef]);

  if (nodeDef?.uuid && NodeDefs.isEntity(nodeDef)) {
    return isTable || isMultiple ? <TableEntity /> : <Entity />;
  }
  return <View />;
};

export default EntityPage;

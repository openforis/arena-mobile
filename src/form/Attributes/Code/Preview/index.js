import {NodeDefs} from '@openforis/arena-core';
import React, {memo} from 'react';
import {useSelector} from 'react-redux';

import surveySelectors from 'state/survey/selectors';

import CodeCheckbox from './CodeCheckbox';
import CodeDropdown from './CodeDropdown';
import {useCode} from './hooks';

// TODO move to arena-core, maybe other name
NodeDefs.getLayoutRenderTypePerCycle = ({nodeDef, cycle = 0}) =>
  nodeDef?.props.layout[cycle]?.renderType;

const MAX_NUMBER_ITEMS_FOR_CHECKBOX = 15;

const Preview = ({nodeDef}) => {
  const cycle = useSelector(surveySelectors.getSurveyCycle);
  const {categoryItems} = useCode({nodeDef});

  if (nodeDef.analysis) {
    return <></>;
  }
  if (
    NodeDefs.getLayoutRenderTypePerCycle({nodeDef, cycle}) === 'checkbox' &&
    categoryItems.length < MAX_NUMBER_ITEMS_FOR_CHECKBOX
  ) {
    return <CodeCheckbox nodeDef={nodeDef} />;
  }

  return <CodeDropdown nodeDef={nodeDef} />;
};

const arePropsEqual = (prevProps, nextProps) => {
  return prevProps.nodeDef.uuid === nextProps.nodeDef.uuid;
};

export default memo(Preview, arePropsEqual);

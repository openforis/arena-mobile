import {NodeDefs} from '@openforis/arena-core';
import React from 'react';
import {useSelector} from 'react-redux';

import surveySelectors from 'state/survey/selectors';

import CodeCheckbox from './CodeCheckbox';
import CodeDropdown from './CodeDropdown';

// TODO move to arena-core, maybe other name
NodeDefs.getLayoutRenderTypePerCycle = ({nodeDef, cycle = 0}) =>
  nodeDef?.props.layout[cycle].renderType;

const Preview = ({nodeDef}) => {
  const cycle = useSelector(surveySelectors.getSurveyCycle);
  if (NodeDefs.getLayoutRenderTypePerCycle({nodeDef, cycle}) === 'checkbox') {
    return <CodeCheckbox nodeDef={nodeDef} />;
  }

  return <CodeDropdown nodeDef={nodeDef} />;
};

export default Preview;

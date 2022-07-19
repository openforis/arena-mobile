import {NodeDefs} from '@openforis/arena-core';
import React from 'react';

import CodeCheckbox from './CodeCheckbox';
import CodeDropdown from './CodeDropdown';

// TODO move to arena-core, maybe other name
NodeDefs.getLayoutRenderTypePerCycle = ({nodeDef, cycle = 0}) =>
  nodeDef.props.layout[cycle].renderType;

const Preview = ({nodeDef}) => {
  if (NodeDefs.getLayoutRenderTypePerCycle({nodeDef}) === 'checkbox') {
    return <CodeCheckbox nodeDef={nodeDef} />;
  }

  return <CodeDropdown nodeDef={nodeDef} />;
};

export default Preview;

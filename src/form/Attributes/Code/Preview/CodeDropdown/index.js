import {NodeDefs} from '@openforis/arena-core';
import React from 'react';
import {useSelector} from 'react-redux';

import BaseContainer from 'form/Attributes/common/Base/common/BaseContainer';
import {selectors as formSelectors} from 'state/form';

import CodeDropdownMultiple from './CodeDropdownMultiple';
import CodeDropdownSingle from './CodeDropdownSingle';

const CodeDropdown = ({nodeDef}) => {
  const nodes = useSelector(state =>
    formSelectors.getNodeDefNodesInHierarchy(state, nodeDef),
  );

  return (
    <BaseContainer nodeDef={nodeDef} nodes={nodes}>
      {NodeDefs.isMultiple(nodeDef) ? (
        <CodeDropdownMultiple nodeDef={nodeDef} />
      ) : (
        <CodeDropdownSingle nodeDef={nodeDef} />
      )}
    </BaseContainer>
  );
};

export default CodeDropdown;

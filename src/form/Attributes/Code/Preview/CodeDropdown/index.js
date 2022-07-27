import {NodeDefs} from '@openforis/arena-core';
import React from 'react';
import {useSelector} from 'react-redux';

import {BasePreviewContainer} from 'form/Attributes/common/Base/Preview';
import {selectors as formSelectors} from 'state/form';

import CodeDropdownMultiple from './CodeDropdownMultiple';
import CodeDropdownSingle from './CodeDropdownSingle';

const CodeDropdown = ({nodeDef}) => {
  const nodes = useSelector(state =>
    formSelectors.getNodeDefNodesInHierarchy(state, nodeDef),
  );

  return (
    <BasePreviewContainer nodeDef={nodeDef} nodes={nodes}>
      {NodeDefs.isMultiple(nodeDef) ? (
        <CodeDropdownMultiple nodeDef={nodeDef} />
      ) : (
        <CodeDropdownSingle nodeDef={nodeDef} />
      )}
    </BasePreviewContainer>
  );
};

export default CodeDropdown;

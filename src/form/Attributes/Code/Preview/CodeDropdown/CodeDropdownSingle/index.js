import React, {useMemo} from 'react';
import {useSelector} from 'react-redux';

import {selectors as formSelectors} from 'state/form';

import CodeNodeDropdown from '../../components/CodeNodeDropdown';

const CodeDropdownSingle = ({nodeDef}) => {
  const nodes = useSelector(state =>
    formSelectors.getNodeDefNodesInHierarchy(state, nodeDef),
  );

  const node = useMemo(() => {
    return nodes?.[0];
  }, [nodes]);

  return <CodeNodeDropdown nodeDef={nodeDef} node={node} />;
};

export default CodeDropdownSingle;

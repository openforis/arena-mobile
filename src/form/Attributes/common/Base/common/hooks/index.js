import {NodeDefType, NodeDefs} from '@openforis/arena-core';
import {useSelector} from 'react-redux';

import {useCode} from 'form/Attributes/Code/Preview/hooks';
import {selectors as formSelectors} from 'state/form';

export const useIsDisabled = (nodeDef, node) => {
  const disabled = useSelector(state =>
    formSelectors.isNodeDefDisabled(state, nodeDef),
  );

  const {categoryItems} = useCode({
    nodeDef,
    node,
  });

  const parentEntityNodeDef = useSelector(state =>
    formSelectors.getParentEntityNodeDef(state, nodeDef),
  );

  if (!NodeDefType.code !== nodeDef.type) {
    return disabled;
  }

  return (
    disabled ||
    categoryItems.length === 0 ||
    NodeDefs.isEnumerate(parentEntityNodeDef)
  );
};

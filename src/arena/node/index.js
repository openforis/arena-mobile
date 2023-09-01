import {NodeDefType} from '@openforis/arena-core';

export const getValueAsString = (nodeDef, node, defaultValue = '') => {
  if (nodeDef.type === NodeDefType.text) {
    return String(node?.value || defaultValue);
  }
  if (isNaN(node?.value)) {
    return String(defaultValue);
  }

  return String(node?.value);
};

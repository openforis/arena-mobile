import {NodeDefType, NodeDefs} from '@openforis/arena-core';
import throttle from 'lodash.throttle';
import React, {useState, useCallback, useMemo} from 'react';
import {Platform} from 'react-native';
import {useSelector} from 'react-redux';

export const getValueAsString = (nodeDef, node, defaultValue = '') => {
  if (nodeDef.type === NodeDefType.text) {
    return String(node?.value || defaultValue);
  }
  if (isNaN(node?.value)) {
    return String(defaultValue);
  }
  return String(node?.value);
};

import React from 'react';

import {EditablePreview} from '../../common/BaseInput';

// float numeric  ios: decimal-pad
// integer numeric, ios: number-pad
const IntegerEditablePreview = ({nodeDef}) => (
  <EditablePreview nodeDef={nodeDef} keyboardType="number-pad" />
);

export default IntegerEditablePreview;

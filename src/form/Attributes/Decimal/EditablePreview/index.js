import React from 'react';
import {Platform} from 'react-native';

import {EditablePreview} from '../../common/BaseInput';

const DecimalEdtiablePreview = ({nodeDef}) => (
  <EditablePreview
    nodeDef={nodeDef}
    keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
  />
);

export default DecimalEdtiablePreview;

import React from 'react';
import {Platform} from 'react-native';

import {Form} from '../../common/BaseInput';

const DecimalForm = ({nodeDef}) => (
  <Form
    nodeDef={nodeDef}
    keyboardType={Platform.OS === 'ios' ? 'decimal-pad' : 'numeric'}
  />
);

export default DecimalForm;

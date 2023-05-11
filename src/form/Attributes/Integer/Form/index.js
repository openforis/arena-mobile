import React from 'react';

import {Form} from '../../common/BaseInput';

// float numeric  ios: decimal-pad
// integer numeric, ios: number-pad
const IntegerForm = ({nodeDef}) => (
  <Form nodeDef={nodeDef} keyboardType="number-pad" />
);

export default IntegerForm;

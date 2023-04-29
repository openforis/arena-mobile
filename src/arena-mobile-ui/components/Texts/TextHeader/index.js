import * as React from 'react';

import TextBase from '../TextBase';

const TextHeader = ({children, size}) => (
  <TextBase type="header" size={size}>
    {children}
  </TextBase>
);

export default TextHeader;

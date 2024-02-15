import * as React from 'react';

import TextBase from '../TextBase';

const TextTitle = ({children, size, customStyle}) => (
  <TextBase type="title" size={size} customStyle={customStyle}>
    {children}
  </TextBase>
);

export default TextTitle;
